import DrizzleN from "../contracts/DrizzleN.cdc"
import FUSD from "../contracts/FUSD.cdc"

transaction(dropID: UInt64, amount: UFix64) {
    let airdrop: &DrizzleN.Drop
    let vault: &FUSD.Vault

    prepare(acct: AuthAccount) {
        let dropCollection = acct.borrow<&DrizzleN.DropCollection>(from: DrizzleN.DropCollectionStoragePath)
            ?? panic("Could not borrow dropCollection")

        self.vault = acct.borrow<&FUSD.Vault>(from: /storage/fusdVault)
            ?? panic("Could not borrow fusdVault")

        self.airdrop = dropCollection.borrowDropRef(dropID: dropID)!
    }

    execute {
        let v <- self.vault.withdraw(amount: amount)
        self.airdrop.deposit(from: <- v)
    }
}