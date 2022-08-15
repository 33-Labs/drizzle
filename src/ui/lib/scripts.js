import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const DrizzleRecorderPath = "0xDrizzleRecorder"
const MistPath = "0xMist"
const FlownsPath = "0xFlowns"
const Domains = "0xDomains"
const FINDPath = "0xFIND"
const DomainUtils = "0xDomainUtils"

export const queryDefaultDomainsOfAddresses = async (addresses) => {
  if (addresses.length == 0) {
    return {}
  }

  const code = `
  import DomainUtils from 0xDomainUtils

  pub fun main(addresses: [Address]): {Address: {String: String}} {
      return DomainUtils.getDefaultDomainsOfAddresses(addresses)
  }
  `
  .replace(DomainUtils, publicConfig.domainUtilsAddress)

  const domains = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(addresses, t.Array(t.Address)),
    ]
  })

  return domains
}

export const queryAddressesOfDomains = async (domains) => {
  if (domains.length == 0) {
    return {}
  }

  const names = []
  const roots = []
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i]
    const elements = domain.split(".")
    if (elements.length != 2) {
      continue
    }

    names.push(elements[0])
    roots.push(elements[1])
  }

  const code = `
  import DomainUtils from 0xDomainUtils

  pub fun main(names: [String], roots: [String]): {String: Address} {
      return DomainUtils.getAddressesOfDomains(names: names, roots: roots)
  }
  `
  .replace(DomainUtils, publicConfig.domainUtilsAddress)

  const addresses = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(names, t.Array(t.String)),
      arg(roots, t.Array(t.String)),
    ]
  }) 

  return addresses
}

export const queryRecords = async (account) => {
  const code = `
  import DrizzleRecorder from 0xDrizzleRecorder
  import Mist from 0xMist
  import DomainUtils from 0xDomainUtils

  pub struct Host {
    pub let address: Address
    pub let domains: {String: String}

    init(address: Address, domains: {String: String}) {
      self.address = address
      self.domains = domains
    }
  }

  pub struct DropRecord {
    pub let dropID: UInt64
    pub let host: Host
    pub let name: String
    pub let tokenSymbol: String
    pub let claimedAmount: UFix64
    pub let claimedAt: UFix64
    pub let extraData: {String: AnyStruct}

    init(cloudDrop: DrizzleRecorder.CloudDrop) {
      self.dropID = cloudDrop.dropID
      self.host = Host(address: cloudDrop.host, domains: DomainUtils.getDefaultDomainsOfAddress(cloudDrop.host))
      self.name = cloudDrop.name
      self.tokenSymbol = cloudDrop.tokenSymbol
      self.claimedAmount = cloudDrop.claimedAmount
      self.claimedAt = cloudDrop.claimedAt
      self.extraData = cloudDrop.extraData
    }
  }

  pub struct RaffleRecord {
    pub let raffleID: UInt64
    pub let host: Host
    pub let name: String
    pub let nftName: String
    pub let registeredAt: UFix64
    pub let rewardTokenIDs: [UInt64]
    pub var claimedAt: UFix64?
    pub let extraData: {String: AnyStruct}
    pub let status: String

    init(mistRaffle: DrizzleRecorder.MistRaffle, status: String) {
        self.raffleID = mistRaffle.raffleID
        self.host = Host(address: mistRaffle.host, domains: DomainUtils.getDefaultDomainsOfAddress(mistRaffle.host))
        self.name = mistRaffle.name
        self.nftName = mistRaffle.nftName
        self.registeredAt = mistRaffle.registeredAt
        self.rewardTokenIDs = mistRaffle.rewardTokenIDs
        self.claimedAt = mistRaffle.claimedAt
        self.extraData = mistRaffle.extraData
        self.status = status
    }
}

pub fun getRaffleStatus(account: Address, record: DrizzleRecorder.MistRaffle): String {
    var status = "UNKNOWN"
    if record.claimedAt != nil {
        status = "YES"
    } else {
        let raffleCollection =
            getAccount(record.host)
            .getCapability(Mist.RaffleCollectionPublicPath)
            .borrow<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>()
        
        if let collection = raffleCollection {
            if let raffleRef = collection.borrowPublicRaffleRef(raffleID: record.raffleID) {
                if let winner = raffleRef.getWinner(account: account) {
                    status = "YES"
                } else {
                    let winners = raffleRef.getWinners()
                    if UInt64(winners.keys.length) == raffleRef.numberOfWinners {
                        status = "NO"
                    }
                }
            } else {
                status = "NOT FOUND"
            }
        } else {
            status = "NOT FOUND"
        }
    }
    return status
}

  pub fun main(account: Address): {String: {UInt64: AnyStruct}} {
      let recorder =
          getAccount(account)
          .getCapability(DrizzleRecorder.RecorderPublicPath)
          .borrow<&{DrizzleRecorder.IRecorderPublic}>()
      
      let res: {String: {UInt64: AnyStruct}} = {}
      if let _recorder = recorder {
          let dropType = Type<DrizzleRecorder.CloudDrop>()
          let dropRecords = _recorder.getRecordsByType(dropType)
          let dropRes: {UInt64: AnyStruct} = {}
          for key in dropRecords.keys {
            let _record = dropRecords[key]!
            let record = _record as! DrizzleRecorder.CloudDrop
            let rec = DropRecord(cloudDrop: record)
            dropRes[key] = rec
          }

          let raffleType = Type<DrizzleRecorder.MistRaffle>()
          let raffleRecords = _recorder.getRecordsByType(raffleType)
          let raffleRes: {UInt64: AnyStruct} = {}
          for key in raffleRecords.keys {
              let _record = raffleRecords[key]!
              let record = _record as! DrizzleRecorder.MistRaffle
              let status = getRaffleStatus(account: account, record: record)
              let rec = RaffleRecord(mistRaffle: record, status: status)
              raffleRes[key] = rec
          }
          res[dropType.identifier] = dropRes
          res[raffleType.identifier] = raffleRes
          return res
      }
  
      return {}
  }
  `
  .replace(DrizzleRecorderPath, publicConfig.drizzleRecorderAddress)
  .replace(MistPath, publicConfig.mistAddress)
  .replace(DomainUtils, publicConfig.domainUtilsAddress)

  const records = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address)
    ]
  }) 

  return records
}
