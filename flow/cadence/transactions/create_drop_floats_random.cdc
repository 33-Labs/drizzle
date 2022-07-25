import FungibleToken from "../contracts/core/FungibleToken.cdc"
import Drizzle from "../contracts/Drizzle.cdc"
import Cloud from "../contracts/Cloud.cdc"
import EligibilityVerifiers from "../contracts/EligibilityVerifiers.cdc"
import Distributors from "../contracts/Distributors.cdc"

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
    eventIDs: [UInt64],
    eventHosts: [Address],
    capacity: UInt32,
    threshold: UInt64,
    tokenAmount: UFix64 
) {
    let dropCollection: &Cloud.DropCollection
    let vault: &FungibleToken.Vault

    prepare(acct: AuthAccount) {
        if acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath) == nil {
            acct.save(<- Cloud.createEmptyDropCollection(), to: Cloud.DropCollectionStoragePath)
            let cap = acct.link<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>(
                Cloud.DropCollectionPublicPath,
                target: Cloud.DropCollectionStoragePath
            ) ?? panic("Could not link DropCollection to PublicPath")
        }

        self.dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
            ?? panic("Could not borrow DropCollection from signer")

        let providerPath = StoragePath(identifier: tokenProviderPath)!
        self.vault = acct.borrow<&FungibleToken.Vault>(from: providerPath)
            ?? panic("Could not borrow Vault from signer")
    }

    pre {
        eventIDs.length == eventHosts.length: "eventIDs should have the same length with eventHosts"
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

        let distributor = Distributors.Random(
            capacity: capacity,
            totalAmount: tokenAmount
        )

        let events: [EligibilityVerifiers.FLOATEventData] = []
        var counter = 0
        while counter < eventIDs.length {
            let event = EligibilityVerifiers.FLOATEventData(host: eventHosts[counter], eventID: eventIDs[counter])
            events.append(event)
            counter = counter + 1
        }

        let verifier = EligibilityVerifiers.FLOATs(
            events: events,
            threshold: threshold
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
            distributor: distributor,
            verifyMode: Drizzle.EligibilityVerifyMode.all,
            verifiers: [verifier], 
            vault: <- dropVault
        )
    }
}