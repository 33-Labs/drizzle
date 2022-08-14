import DrizzleRecorder from "../../contracts/DrizzleRecorder.cdc"
import Mist from "../../contracts/Mist.cdc"

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

pub fun main(account: Address): {UInt64: AnyStruct} {
    let recorder =
        getAccount(account)
        .getCapability(DrizzleRecorder.RecorderPublicPath)
        .borrow<&{DrizzleRecorder.IRecorderPublic}>()
    
    if let _recorder = recorder {
        let type = Type<DrizzleRecorder.MistRaffle>()
        let records = _recorder.getRecordsByType(type)
        let res: {UInt64: AnyStruct} = {}
        for key in records.keys {
            let _record = records[key]!
            let record = _record as! DrizzleRecorder.MistRaffle
            let status = getRaffleStatus(account: account, record: record)
            let rec = RaffleRecord(mistRaffle: record, status: status)
            res[key] = rec
        }
        return res
    }

    return {}
}