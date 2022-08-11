import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const DrizzleRecorderPath = "0xDrizzleRecorder"
const MistPath = "0xMist"

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
                status = "UNEXIST"
            }
        } else {
            status = "UNEXIST"
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
