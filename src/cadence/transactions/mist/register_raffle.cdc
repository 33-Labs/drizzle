import NonFungibleToken from "../contracts/core/NonFungibleToken.cdc"
import Mist from "../contracts/Mist.cdc"
import DrizzleRecorder from "../../contracts/DrizzleRecorder.cdc"

transaction(raffleID: UInt64, host: Address) {
    let raffle: &{Mist.IRafflePublic}
    let address: Address
    let recorderRef: &DrizzleRecorder.Recorder

    prepare(acct: AuthAccount) {
        self.address = acct.address

        let raffleCollection = getAccount(host)
            .getCapability(Mist.RaffleCollectionPublicPath)
            .borrow<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>()
            ?? panic("Could not borrow the public RaffleCollection from the host")
        
        let raffle = raffleCollection.borrowPublicRaffleRef(raffleID: raffleID)
            ?? panic("Could not borrow the public Raffle from the collection")

        if (acct.borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath) == nil) {
            acct.save(<-DrizzleRecorder.createEmptyRecorder(), to: DrizzleRecorder.RecorderStoragePath)

            acct.link<&{DrizzleRecorder.IRecorderPublic}>(
                DrizzleRecorder.RecorderPublicPath,
                target: DrizzleRecorder.RecorderStoragePath
            )
        }

        self.raffle = raffle 
        self.recorderRef = acct
            .borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath)
            ?? panic("Could not borrow Recorder")
    }

    execute {
        self.raffle.register(account: self.address, params: {
            "recorderRef": self.recorderRef
        })
    }
}