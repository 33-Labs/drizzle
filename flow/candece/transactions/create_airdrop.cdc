import Drizzle from "../contracts/Drizzle.cdc"
import DrizzleN from "../contracts/DrizzleN.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"

transaction(
    name: String,
    description: String,
    image: String,
    claims: {Address: UFix64},
    tokenIssuer: Address,
    tokenContractName: String,
    tokenProviderPath: String,
    tokenBalancePath: String,
    tokenReceiverPath: String,
    tokenAmount: UFix64 
) {
    let dropCollection: &DrizzleN.DropCollection
    let vault: &FungibleToken.Vault

    prepare(acct: AuthAccount) {
        if acct.borrow<&DrizzleN.DropCollection>(from: DrizzleN.DropCollectionStoragePath) == nil {
            acct.save(<- DrizzleN.createEmptyDropCollection(), to: DrizzleN.DropCollectionStoragePath)
            acct.link<&DrizzleN.DropCollection{Drizzle.IDropCollectionPublic}>(
                DrizzleN.DropCollectionPublicPath,
                target: DrizzleN.DropCollectionStoragePath
            )
        }

        self.dropCollection = acct.borrow<&DrizzleN.DropCollection>(from: DrizzleN.DropCollectionStoragePath)
            ?? panic("Could not borrow DropCollection from signer")

        let providerPath = StoragePath(identifier: tokenProviderPath)!
        self.vault = acct.borrow<&FungibleToken.Vault>(from: providerPath)
            ?? panic("Could not borrow Vault from signer")
    }

    execute {
        let dropVault <- self.vault.withdraw(amount: tokenAmount)
        let tokenInfo = Drizzle.TokenInfo(
            account: tokenIssuer,
            contractName: tokenContractName,
            providerPath: tokenProviderPath,
            balancePath: tokenBalancePath,
            receiverPath: tokenReceiverPath
        )

        self.dropCollection.createDrop(
            name: name, 
            description: description, 
            host: self.vault.owner!.address, 
            image: image, 
            tokenInfo: tokenInfo,
            vault: <- dropVault, 
            claims: claims
        )
    }
}