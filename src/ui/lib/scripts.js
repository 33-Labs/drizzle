import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const DrizzleRecorderPath = "0xDrizzleRecorder"
const MistPath = "0xMist"
const FlownsPath = "0xFlowns"
const Domains = "0xDomains"
const FINDPath = "0xFIND"

export const queryDomainOfAddresses = async (addresses) => {
  const code = `
  import Flowns from 0xFlowns
  import Domains from 0xDomains
  import FIND from 0xFIND

  pub fun main(addresses: [Address]): {Address: {String: String?}} {
    let res: {Address: {String: String?}} = {}
    for address in addresses {
        let domains: {String: String?} = {"flowns": nil, "find": nil}
        if let domain = FIND.reverseLookup(address) {
            domains["find"] = domain.concat(".find")
        }
        if let domain = getFlownsDomain(address: address) {
            domains["flowns"] = domain
        }
        res[address] = domains
    }
    return res
  }

  pub fun getFlownsDomain(address: Address): String? {
      let account = getAccount(address)
      let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath)
      if !collectionCap.check() {
          return nil
      }

      let collection = collectionCap.borrow()!
      let ids = collection.getIDs()
      if ids.length == 0 {
          return nil
      }

      var defaultDomainID: UInt64 = ids[0]
      for id in ids {
          let domain = collection.borrowDomain(id: id)
          let isDefault = domain.getText(key: "isDefault")
          if isDefault == "true" {
              defaultDomainID = id
              break
          }
      }

      let domain = collection.borrowDomain(id: defaultDomainID)
      return domain.name.concat(".").concat(domain.parent)
  }
  `
  .replace(FlownsPath, publicConfig.flownsAddress)
  .replace(Domains, publicConfig.domainsAddress)
  .replace(FINDPath, publicConfig.findAddress)

  const domains = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(addresses, t.Array(t.Address)),
    ]
  })

  return domains
}

export const queryAddressOfDomains = async (domains) => {
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
  import Flowns from 0xFlowns
  import Domains from 0xDomains
  import FIND from 0xFIND

  pub fun main(names: [String], roots: [String]): {String: Address} {
    pre {
        names.length == roots.length: "names and roots should have the same length"
    }

    let res: {String: Address} = {}
    for index, name in names {
        let root = roots[index]
        if let address = getAddressOfDomain(name: name, root: root) {
          let domain = name.concat(".").concat(root)
          res[domain] = address
        }
    }

    return res
  }

  pub fun getAddressOfDomain(name: String, root: String): Address? {
      if FIND.validateFindName(name) && root == "find" {
          if let address = FIND.lookupAddress(name) {
              return address
          }
      }

      return getFlownsAddress(name: name, root: root)
  }

  pub fun getFlownsAddress(name: String, root: String): Address? {
      let prefix = "0x"
      let rootHash = Flowns.hash(node: "", lable: root)
      let nameHash = prefix.concat(Flowns.hash(node: rootHash, lable: name))
      return Domains.getRecords(nameHash)
  }
  `
  .replace(FlownsPath, publicConfig.flownsAddress)
  .replace(Domains, publicConfig.domainsAddress)
  .replace(FINDPath, publicConfig.findAddress)

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

  pub struct RaffleRecord {
    pub let raffleID: UInt64
    pub let host: Address
    pub let name: String
    pub let nftName: String
    pub let registeredAt: UFix64
    pub let rewardTokenIDs: [UInt64]
    pub var claimedAt: UFix64?
    pub let extraData: {String: AnyStruct}
    pub let status: String

    init(mistRaffle: DrizzleRecorder.MistRaffle, status: String) {
        self.raffleID = mistRaffle.raffleID
        self.host = mistRaffle.host
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
          res[dropType.identifier] = dropRecords
          res[raffleType.identifier] = raffleRes
          return res
      }
  
      return {}
  }
  `
  .replace(DrizzleRecorderPath, publicConfig.drizzleRecorderAddress)
  .replace(MistPath, publicConfig.mistAddress)

  const records = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address)
    ]
  }) 

  return records
}
