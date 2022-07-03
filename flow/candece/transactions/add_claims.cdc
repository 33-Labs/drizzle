import DrizzleN from "../contracts/DrizzleN.cdc"

transaction(
    dropID: UInt64, 
    newClaims: {Address: UFix64}
) {
    let airdrop: &DrizzleN.Drop
    
    prepare(acct: AuthAccount) {
        let dropCollection = acct.borrow<&DrizzleN.DropCollection>(from: DrizzleN.DropCollectionStoragePath)
            ?? panic("Could not borrow dropCollection")

        self.airdrop = dropCollection.borrowDropRef(dropID: dropID)!
    }

    execute {
        self.airdrop.addClaims(newClaims)
    }
}