import DropN from "../contracts/DropN.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"

transaction(
    dropID: UInt64,
    tokenIssuer: Address,
    tokenReceiverPath: String
) {

    let drop: &DropN.Drop
    let receiver: &{FungibleToken.Receiver}

    prepare(acct: AuthAccount) {
        let dropCollection = acct.borrow<&DropN.DropCollection>(from: DropN.DropCollectionStoragePath)
            ?? panic("Could not borrow dropCollection")
        self.drop = dropCollection.borrowDropRef(dropID: dropID)!

        let receiverPath = PublicPath(identifier: tokenReceiverPath)!
        self.receiver = acct.getCapability(receiverPath).borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow Receiver from signer")
    }

    execute {
        self.drop.withdrawAll(receiver: self.receiver)
    }
}