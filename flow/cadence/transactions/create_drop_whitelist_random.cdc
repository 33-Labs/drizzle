import FungibleToken from "../contracts/core/FungibleToken.cdc"
import Drizzle from "../contracts/Drizzle.cdc"
import Cloud from "../contracts/Cloud.cdc"
import EligibilityReviewers from "../contracts/EligibilityReviewers.cdc"
import Packets from "../contracts/Packets.cdc"

transaction(
    name: String,
    description: String,
    image: String?,
    url: String?,
    startAt: UFix64?,
    endAt: UFix64?,
    // TokenInfo
    tokenIssuer: Address,
    tokenContractName: String,
    tokenSymbol: String,
    tokenProviderPath: String,
    tokenBalancePath: String,
    tokenReceiverPath: String,
    // Eligibility
    whitelist: {Address: Bool},
    capacity: UInt32,
    threshold: UInt64,
    tokenAmount: UFix64 
) {
    let dropCollection: &Cloud.DropCollection
    let vault: &FungibleToken.Vault

    prepare(acct: AuthAccount) {
        if acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath) == nil {
            acct.save(<- Cloud.createEmptyDropCollection(), to: Cloud.DropCollectionStoragePath)
            acct.link<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>(
                Cloud.DropCollectionPublicPath,
                target: Cloud.DropCollectionStoragePath
            )
        }

        self.dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
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
            symbol: tokenSymbol,
            providerPath: tokenProviderPath,
            balancePath: tokenBalancePath,
            receiverPath: tokenReceiverPath
        )

        let packet = Packets.RandomPacket(
            capacity: capacity,
            totalAmount: tokenAmount
        )

        let reviewer = EligibilityReviewers.Whitelist(
            packet: packet,
            whitelist: whitelist,
        )

        self.dropCollection.createDrop(
            name: name, 
            description: description, 
            host: self.vault.owner!.address, 
            image: image,
            url: url,
            startAt: startAt,
            endAt: endAt,
            tokenInfo: tokenInfo,
            eligibilityReviewer: reviewer, 
            vault: <- dropVault,
        )
    }
}