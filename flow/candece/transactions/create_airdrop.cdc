import Drizzle from "../contracts/Drizzle.cdc"
import DropN from "../contracts/DropN.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"

transaction(
    name: String,
    description: String,
    image: String?,
    url: String?,
    claims: {Address: UFix64},
    startAt: UFix64?,
    endAt: UFix64?,
    tokenIssuer: Address,
    tokenContractName: String,
    tokenProviderPath: String,
    tokenBalancePath: String,
    tokenReceiverPath: String,
    tokenAmount: UFix64 
) {
    let dropCollection: &DropN.DropCollection
    let vault: &FungibleToken.Vault

    prepare(acct: AuthAccount) {
        if acct.borrow<&DropN.DropCollection>(from: DropN.DropCollectionStoragePath) == nil {
            acct.save(<- DropN.createEmptyDropCollection(), to: DropN.DropCollectionStoragePath)
            acct.link<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>(
                DropN.DropCollectionPublicPath,
                target: DropN.DropCollectionStoragePath
            )
        }

        self.dropCollection = acct.borrow<&DropN.DropCollection>(from: DropN.DropCollectionStoragePath)
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
            url: url,
            tokenInfo: tokenInfo,
            vault: <- dropVault, 
            claims: claims,
            startAt: startAt,
            endAt: endAt
        )
    }
}