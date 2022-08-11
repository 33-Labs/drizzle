import FungibleToken from "../contracts/core/FungibleToken.cdc"
import FUSD from "../contracts/core/FUSD.cdc"
import Cloud from "../contracts/Cloud.cdc"
import DrizzleRecorder from "../../contracts/DrizzleRecorder.cdc"

transaction(dropID: UInt64, host: Address) {
    let drop: &{Cloud.IDropPublic}
    let receiver : &FUSD.Vault{FungibleToken.Receiver}
    let recorderRef: &DrizzleRecorder.Recorder

    prepare(acct: AuthAccount) {
        let dropCollection = getAccount(host)
            .getCapability(Cloud.DropCollectionPublicPath)
            .borrow<&Cloud.DropCollection{Cloud.IDropCollectionPublic}>()
            ?? panic("Could not borrow the public DropCollection from the host")
        
        let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
            ?? panic("Could not borrow the public Drop from the collection")

        if (acct.borrow<&FUSD.Vault>(from: /storage/fusdVault) == nil) {
            acct.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)

            acct.link<&FUSD.Vault{FungibleToken.Receiver}>(
                /public/fusdReceiver,
                target: /storage/fusdVault
            )

            acct.link<&FUSD.Vault{FungibleToken.Balance}>(
                /public/fusdBalance,
                target: /storage/fusdVault
            )
        }

        if (acct.borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath) == nil) {
            acct.save(<-DrizzleRecorder.createEmptyRecorder(), to: DrizzleRecorder.RecorderStoragePath)

            acct.link<&{DrizzleRecorder.IRecorderPublic}>(
                DrizzleRecorder.RecorderPublicPath,
                target: DrizzleRecorder.RecorderStoragePath
            )
        }
        
        self.drop = drop 
        self.receiver = acct
            .getCapability(/public/fusdReceiver)
            .borrow<&FUSD.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow Receiver")

        self.recorderRef = acct
            .borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath)
            ?? panic("Could not borrow Recorder")
    }

    execute {
        self.drop.claim(receiver: self.receiver, params: {
            "recorderRef": self.recorderRef
        })
    }
}