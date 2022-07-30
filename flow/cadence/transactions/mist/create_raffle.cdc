import FungibleToken from "../contracts/core/FungibleToken.cdc"
import Mist from "../contracts/Mist.cdc"
import EligibilityVerifiers from "../contracts/EligibilityVerifiers.cdc"
import Distributors from "../contracts/Distributors.cdc"
import ExampleNFT from "../contracts/examplenft/ExampleNFT.cdc"

transaction(
    name: String,
    description: String,
    image: String?,
    url: String?,
    startAt: UFix64?,
    endAt: UFix64?,
    registerEndAt: UFix64,
    numberOfWinners: UInt64,
    // NFTInfo
    nftContractAddress: Address,
    nftContractName: String,
    nftDisplayName: String,
    nftCollectionStoragePath: String,
    nftCollectionPublicPath: String,
    rewardTokenIDs: [UInt64],
    // EligibilityVerifier
    // Only support registrationVerify now
    withWhitelist: Bool,
    whitelist: {Address: Bool},

    withFloats: Bool,
    threshold: UInt32?,
    eventIDs: [UInt64],
    eventHosts: [Address],

    withFloatGroup: Bool,
    floatGroupName: String?,
    floatGroupHost: Address?
) {
    let raffleCollection: &Mist.NFTRaffleCollection
    let nftCollectionRef: &ExampleNFT.Collection

    prepare(acct: AuthAccount) {
        if acct.borrow<&Mist.NFTRaffleCollection>(from: Mist.NFTRaffleCollectionStoragePath) == nil {
            acct.save(<- Mist.createEmptyNFTRaffleCollection(), to: Mist.NFTRaffleCollectionStoragePath)
            let cap = acct.link<&Mist.NFTRaffleCollection{Mist.INFTRalleCollectionPublic}>(
                Mist.NFTRaffleCollectionPublicPath,
                target: Mist.NFTRaffleCollectionStoragePath
            ) ?? panic("Could not link NFTRaffleCollection to PublicPath")
        }

        self.raffleCollection = acct.borrow<&Mist.NFTRaffleCollection>(from: Mist.NFTRaffleCollectionStoragePath)
            ?? panic("Could not borrow NFTRaffleCollection from signer")

        let nftStoragePath = StoragePath(identifier: nftCollectionStoragePath)!
        self.nftCollectionRef = acct.borrow<&ExampleNFT.Collection>(from: nftStoragePath)
            ?? panic("Could not borrow collection from signer")
    }

    execute {
        let nftInfo = Mist.NFTInfo(
            contractName: nftContractName,
            contractAddress: nftContractAddress,
            displayName: nftDisplayName,
            nftCollectionStoragePath: StoragePath(identifier: nftCollectionStoragePath)!,
            nftCollectionPublicPath: PublicPath(identifier: nftCollectionPublicPath)!
        )
        
        var verifier: {EligibilityVerifiers.IEligibilityVerifier}? = nil
        if withWhitelist {
            verifier = EligibilityVerifiers.Whitelist(
                whitelist: whitelist
            )
        } else if withFloats {
            assert(eventIDs.length == eventHosts.length, message: "eventIDs should have the same length with eventHosts")
            let events: [EligibilityVerifiers.FLOATEventData] = []
            var counter = 0
            while counter < eventIDs.length {
                let event = EligibilityVerifiers.FLOATEventData(host: eventHosts[counter], eventID: eventIDs[counter])
                events.append(event)
                counter = counter + 1
            }
            verifier = EligibilityVerifiers.FLOATs(
                events: events,
                threshold: threshold!
            )
        } else if withFloatGroup {
            let groupData = EligibilityVerifiers.FLOATGroupData(
                host: floatGroupHost!,
                name: floatGroupName!
            )
            verifier = EligibilityVerifiers.FLOATGroup(
                group: groupData,
                threshold: threshold!
            )
        } else {
            panic("invalid verifier")
        }

        let collection <- ExampleNFT.createEmptyCollection()
        for tokenID in rewardTokenIDs {
            let token <- self.nftCollectionRef.withdraw(withdrawID: tokenID)
            collection.deposit(token: <- token)
        }

        self.raffleCollection.createRaffle(
            name: name, 
            description: description, 
            host: self.nftCollectionRef.owner!.address, 
            image: image,
            url: url,
            startAt: startAt,
            endAt: endAt,
            registerEndAt: registerEndAt,
            numberOfWinners: numberOfWinners,
            nftInfo: nftInfo,
            collection: <- collection,
            registrationVerifyMode: EligibilityVerifiers.VerifyMode.all,
            claimVerifyMode: EligibilityVerifiers.VerifyMode.all,
            registrationVerifiers: [verifier!],
            claimVerifiers: [],
            extraData: {}
        )
    }
}