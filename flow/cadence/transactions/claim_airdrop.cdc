import Drizzle from "../contracts/Drizzle.cdc"
import DropN from "../contracts/DropN.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"
import FUSD from "../contracts/FUSD.cdc"


transaction(dropID: UInt64, host: Address) {
    let airdrop: &{Drizzle.IDropPublic}
    let receiver : &FUSD.Vault{FungibleToken.Receiver}

    prepare(acct: AuthAccount) {
        let dropCollection = getAccount(host)
            .getCapability(DropN.DropCollectionPublicPath)
            .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
            ?? panic("Could not borrow the public DropCollection from the host")
        
        let airdrop = dropCollection.borrowPublicDropRef(dropID: dropID)
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
        
        self.airdrop = airdrop 
        self.receiver = acct
            .getCapability(/public/fusdReceiver)
            .borrow<&FUSD.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow Receiver")
    }

    execute {
        self.airdrop.claim(receiver: self.receiver, params: {})
    }

}