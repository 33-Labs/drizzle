import DropN from "../contracts/DropN.cdc"

transaction(
    dropID: UInt64, 
    newClaims: {Address: UFix64}
) {
    let airdrop: &DropN.Drop
    
    prepare(acct: AuthAccount) {
        let dropCollection = acct.borrow<&DropN.DropCollection>(from: DropN.DropCollectionStoragePath)
            ?? panic("Could not borrow dropCollection")

        self.airdrop = dropCollection.borrowDropRef(dropID: dropID)!
    }

    execute {
        self.airdrop.addClaims(newClaims)
    }
}