import NonFungibleToken from "./core/NonFungibleToken.cdc"
import MetadataViews from "./core/MetadataViews.cdc"
import NFTCatalog from "../NFTCatalog/NFTCatalog.cdc"

pub contract Mist {

    pub let MistAdminStoragePath: StoragePath
    pub let MistAdminPublicPath: PublicPath
    pub let MistAdminPrivatePath: PrivatePath

    pub let NFTRaffleCollectionStoragePath: StoragePath
    pub let NFTRaffleCollectionPublicPath: PublicPath
    pub let NFTRaffleCollectionPrivatePath: PrivatePath

    pub event ContractInitialized()

    pub event NFTRaffleRegistered(raffleID: UInt64, name: String, host: Address, registrator: Address, nftIdentifier: String)
    pub event NFTRaffleWinnerDrawn(raffleID: UInt64, name: String, host: Address, winner: Address, nftIdentifier: String, tokenIDs: [UInt64])
    pub event NFTRaffleClaimed(raffleID: UInt64, name: String, host: Address, claimer: Address, nftIdentifier: String, tokenIDs: [UInt64])
    pub event NFTRaffleCreated(raffleID: UInt64, name: String, host: Address, description: String, nftIdentifier: String)
    pub event NFTRaffleDestroyed(raffleID: UInt64, name: String, host: Address)

    pub enum RaffleAvailabilityStatus: UInt8 {
        pub case notStartYet
        pub case ended
        pub case registering
        pub case drawing
        pub case drawn
        pub case expired
        pub case paused
    }

    pub struct RaffleAvailability {
        pub let status: RaffleAvailabilityStatus
        pub let extraData: {String: AnyStruct}

        init(status: RaffleAvailabilityStatus, extraData: {String: AnyStruct}) {
            self.status = status
            self.extraData = extraData
        }

        pub fun getStatus(): String {
            switch self.status {
            case AvailabilityStatus.notStartYet:
                return "not start yet"
            case AvailabilityStatus.ended:
                return "ended"
            case AvailabilityStatus.registering:
                return "registering"
            case AvailabilityStatus.drawing:
                return "drawing"
            case AvailabilityStatus.drawn:
                return "drawn"
            case AvailabilityStatus.expired:
                return "expired"
            case AvailabilityStatus.paused:
                return "paused"
            }
            panic("invalid status")
        }
    }

    pub enum RaffleEligibilityStatus: UInt8 {
        pub case eligibleForRegistering
        pub case eligibleForClaiming

        pub case notEligibleForRegistering
        pub case notEligibleForClaiming

        pub case hasRegistered
        pub case hasClaimed
    }

    pub struct NFTRaffleEligibility {
        pub let status: RaffleEligibilityStatus
        pub let eligibleNFTs: [UInt64]
        pub let extraData: {String: AnyStruct}

        init(
            status: NFTRaffleEligibilityStatus, 
            eligibleNFTs: [UInt64],
            extraData: {String: AnyStruct}) {
            self.status = status
            self.eligibleNFTs = eligibleNFTs
            self.extraData = extraData
        }

        pub fun getStatus(): String {
            switch self.status {
            case RaffleEligibilityStatus.eligibleForRegistering: 
                return "eligible for registering"
            case RaffleEligibilityStatus.eligibleForClaiming:
                return "eligible for claiming"
            case RaffleEligibilityStatus.notEligibleForRegistering:
                return "not eligible for registering"
            case RaffleEligibilityStatus.notEligibleForClaiming:
                return "not eligible for claiming"
            case RaffleEligibilityStatus.hasRegistered:
                return "has registered"
            case RaffleEligibilityStatus.hasClaimed:
                return "has claimed" 
            }
            panic("invalid status")
        }
    }

    pub struct RegistrationRecord {
        pub let address: Address
        pub let extraData: {String: AnyStruct}

        init(address: Address, extraData: {String: AnyStruct}) {
            self.address = address
            self.extraData = extraData
        }
    }

    pub struct WinnerRecord {
        pub let address: Address
        pub let rewardTokenIDs: [UInt64]
        pub let extraData: {String: AnyStruct}
        pub var isClaimed: Bool

        init(
            address: Address, 
            rewardTokenIDs: [UInt64],
            extraData: {String: AnyStruct}
        ) {
            self.address = address
            self.rewardTokenIDs = rewardTokenIDs
            self.extraData = extraData
            self.isClaimed = false
        }
    }

    pub struct NFTInfo {
        pub let nftIdentifier: String
        pub let collectionIdentifier: String
        pub let contractName : String

        pub let contractAddress : Address
        pub let displayName: String

        pub let storagePath : StoragePath
        pub let publicPath : PublicPath

        init(
            contractName: String,
            contractAddress: Address,
            displayName: String,
            storagePath: StoragePath,
            publicPath: PublicPath 
        ) {
            let address = contractAddress.toString()
            let addrTrimmed = address.slice(from: 2, upTo: address.length)

            let contractIdentifier = "A.".concat(addrTrimmed).concat(".").concat(contractName)
            self.nftIdentifier = self.contractIdentifier.concat(".NFT")
            self.collectionIdentifier = contractIdentifier.concat(".Collection")

            self.contractAddress = contractAddress
            self.contractName = contractName
            self.displayName = displayName
        }
    }

    pub struct interface INFTRafflePublic {
        pub let raffleID: UInt64
        pub let name: String
        pub let description: String
        pub let host: Address
        pub let createdAt: UFix64
        pub let image: String?
        pub let url: String?
        pub let startAt: UFix64?
        pub let endAt: UFix64?

        pub let registerEndAt: UFix64
        pub let numberOfwinners: UInt8

        pub let nftInfo: NFTInfo

        pub let verifyMode: Drizzle.EligibilityVerifyMode

        pub var isPaused: Bool
        pub var isEnded: Bool

        pub let extraData: {String: AnyStruct}

        pub fun register(account: Address, params: {String: AnyStruct})
        pub fun hasRegistered(account: Address): Bool
        pub fun getRegisterationRecords(): {Address: RegisterationRecord}
        pub fun getRegisterationRecord(account: Address): RegisterationRecord?

        pub fun getWinners(): {Address: WinnerRecord}
        pub fun getWinner(account: Address): WinnerRecord?

        pub fun claim(receiver: &{NonFungibleToken.Receiver}, params: {String: AnyStruct})
        pub fun checkAvailability(params: {String: AnyStruct}): RaffleAvailability
        pub fun checkRegisterationEligibility(account: Address, params: {String: AnyStruct}): NFTEligibility
        pub fun checkClaimEligibility(account: Address, params: {String: AnyStruct}): NFTEligibility

        pub fun getRegisterationVerifiers(): {String: [{Drizzle.IEligibilityVerifier}]}
        pub fun getClaimVerifiers(): {String: [{Drizzle.IEligibilityVerifier}]}
        
        pub fun getRewards(): [UInt64]
    }

    pub struct NFTRaffle: INFTRafflePublic {
        pub let raffleID: UInt64
        pub let name: String
        pub let description: String
        pub let host: Address
        pub let createdAt: UFix64
        pub let image: String?
        pub let url: String?
        pub let startAt: UFix64?
        pub let endAt: UFix64?

        pub let registerEndAt: UFix64
        pub let numberOfwinners: UInt8

        pub let nftInfo: NFTInfo

        pub let registerationVerifyMode: Drizzle.EligibilityVerifyMode
        pub let claimVerifyMode: Drizzle.EligibilityVerifyMode

        pub var isPaused: Bool
        pub var isEnded: Bool

        pub let extraData: {String: AnyStruct}

        access(account) let registerationVerifiers: {String: [{Drizzle.IEligibilityVerifier}]}
        access(account) let claimVerifiers: {String: [{Drizzle.IEligibilityVerifier}]}
        access(self) let collection: @NonFungibleToken.Collection
        access(self) let registerationRecords: {Address: RegisterRecord}
        access(self) let winners: {Address: WinnerRecord}
        access(self) let candidates: [Address]
        access(self) let nftToBeDrawn: [UInt64]
        access(self) let rewards: [UInt64]

        pub fun register(account: Address, params: {String: AnyStruct}) {
            let availability = self.checkAvailability(params: params)
            assert(availability.status == RaffleAvailabilityStatus.registering, message: availability.getStatus())

            let eligibility = self.checkRegisterationEligibility(acount: account, params: params)
            assert(eligibility.status == RaffleEligibilityStatus.eligibleForRegistering, message: eligibility.getStatus())

            emit RaffleRegistered(
                raffleID: self.raffleID, 
                name: self.name, 
                host: self.host, 
                registrator: account, 
                nftIdentifier: self.nftInfo.nftIdentifier 
            )

            self.registerationRecords[account] = RegisterationRecord(address: account, extraData: {})
            self.candidates.append(account)
        }

        pub fun hasRegistered(account: Address): Bool {
            return self.registerationRecords[account] != nil
        }

        pub fun getRegisterationRecords(): {Address: RegisterationRecord} {
            return self.registerationRecords
        }

        pub fun getRegisterationRecord(account: Address): RegisterationRecord? {
            return self.registerationRecords[account]
        }

        pub fun getWinners(): {Address: WinnerRecord} {
            return self.winners
        }

        pub fun getWinner(account: Address): WinnerRecord {
            return self.winners[account]
        }

        pub fun claim(receiver: &{NonFungibleToken.Receiver}, params: {String: AnyStruct}) {
            let availability = self.checkAvailability(params: params)
            assert(availability.status == RaffleAvailabilityStatus.drawn, message: availability.getStatus())

            let claimer = receiver.owner!.address
            let eligibility = self.checkClaimEligibility(acount: claimer, params: params)
            assert(eligibility.status == RaffleEligibilityStatus.eligibleForClaiming, message: eligibility.getStatus())

            self.winners[claimer]!.isClaimed = true
            let winnerRecord = self.winners[claimer]

            emit RaffleClaimed(
                raffleID: self.raffleID, 
                name: self.name, 
                host: self.host, 
                claimer: claimer, 
                nftIdentifier: self.nftInfo.nftIdentifier, 
                tokenIDs: winnerRecord.eligibleNFTs
            )

            for tokenID in winnerRecord.eligibleNFTs {
                let nft <- self.collection.withdraw(withdrawID: tokenID)
                receiver.deposit(token: <- nft)
            }
        }

        pub fun checkAvailability(params: {String: AnyStruct}): RaffleAvailability {
            if self.isEnded {
                return RaffleAvailability(
                    status: RaffleAvailabilityStatus.ended, 
                    extraData: {}
                )
            }

            if let startAt = self.startAt {
                if getCurrentBlock().timestamp < startAt {
                    return RaffleAvailability(
                        status: RaffleAvailabilityStatus.notStartYet,
                        extraData: {}
                    )
                }
            }

            if let endAt = self.endAt {
                if getCurrentBlock().timestamp > endAt {
                    return RaffleAvailability(
                        status: RaffleAvailabilityStatus.expired,
                        extraData: {}
                    )
                }
            }

            if self.isPaused {
                return Drizzle.Availability(
                    status: RaffleAvailabilityStatus.paused,
                    extraData: {}
                ) 
            }

            assert(self.winners.keys.length <= self.numberOfWinners, message: "invalid winners")

            // can't register but claiming is available
            if self.winners.keys.length == self.numberOfWinners {
                return RaffleAvailability(
                    status: RaffleAvailabilityStatus.drawn,
                    extraData: {}
                )
            }

            // can't register and claim
            if getCurrentBlock().timestamp > registerEndAt {
                return RaffleAvailability(
                    status: RaffleAvailabilityStatus.drawing,
                    extraData: {} 
                )
            }

            return RaffleAvailability(
                status: RaffleAvailabilityStatus.registering,
                extraData: {}
            )
        }

        pub fun checkRegisterationEligibility(account: Address, params: {String: AnyStruct}): NFTRaffleEligibility {
            if let record = self.registerationRecords[account] {
                return NFTRaffleEligibility(
                    status: NFTRaffleEligibilityStatus.hasRegistered,
                    eligibleNFTs: [],
                    extraData: {}
                )
            }

            let isEligible = self.isEligible(
                account: account,
                mode: self.registerationVerifyMode,
                verifiers: self.registerationVerifiers,
                params: params
            ) 

            return NFTRaffleEligibility(
                status: isEligible ? 
                    RaffleEligibilityStatus.eligibleForRegistering : 
                    RaffleEligibilityStatus.notEligibleForRegistering,
                eligibleNFTs: [],
                extraData: {}
            )
        }

        pub fun checkClaimEligibility(account: Address, params: {String: AnyStruct}): NFTRaffleEligibility {
            if self.winners[account] == nil {
                return NFTRaffleEligibility(
                    status: NFTRaffleEligibilityStatus.notEligibleForClaiming,
                    eligibleNFTs: [],
                    extraData: {}
                )
            }

            let record = self.winners[account]!
            if record.isClaimed {
                return NFTRaffleEligibility(
                    status: NFTRaffleEligibilityStatus.hasClaimed,
                    eligibleNFTs: record.rewardTokenIDs,
                    extraData: {}
                ) 
            }

            // Raffle host can add extra requirements to the winners for claiming the NFTs
            // by adding claimVerifiers
            let isEligible = self.isEligible(
                account: account,
                mode: self.claimVerifyMode,
                verifiers: self.claimVerifiers,
                params: params
            ) 

            return NFTRaffleEligibility(
                status: isEligible ? 
                    RaffleEligibilityStatus.eligibleForClaiming: 
                    RaffleEligibilityStatus.eligibleForClaiming,
                eligibleNFTs: record.rewardTokenIDs,
                extraData: {}
            ) 
        }

        pub fun getRewards(): [UInt64] {
            return self.rewards
        }

        access(self) fun isEligible(
            account: Address,
            mode: Drizzle.EligibilityVerifyMode, 
            verifiers: {String: [Drizzle.IEligibilityVerifier]},
            params: {String: AnyStruct}
        ): Bool {
            params.insert(key: "claimer", account)
            if verifyMode == Drizzle.EligibilityVerifyMode.oneOf {
                for identifier in self.verifiers.keys {
                    let verifiers = self.verifiers[identifier]!
                    for verifier in verifiers {
                        if verifier.verify(account: account, params: newParams).isEligible {
                            return true
                        }
                    }
                }
                return false
            } else if verifyMode == Drizzle.EligibilityVerifyMode.all {
                for identifier in self.verifiers.keys {
                    let verifiers = self.verifiers[identifier]!
                    for verifier in verifiers {
                        if !verifier.verify(account: account, params: newParams).isEligible {
                            return false
                        }
                    }
                    return true
                }
            }
            panic("invalid mode")
        }

        pub fun draw(params: {String: AnyStruct}) {
            assert(self.candidates.length > 0, message: "no candidates")
            assert(self.nftToBeDrawn.length >= self.candidates.length, message: "nft is not enough")

            let availability = self.checkAvailability(params: params)
            assert(availability.status == RaffleAvailabilityStatus.drawing, message: availability.getStatus())

            let winnerIndex = unsafeRandom() % self.candidates.length
            winner = self.candidates[winnerIndex]

            let rewardIndex = unsafeRandom() % self.nftToBeDrawn.length
            rewardTokenID = self.nftToBeDrawn[rewardIndex]

            assert(self.winners[winner] == nil, message: "winner already recorded")

            let winnerRecord = WinnerRecord(
                address: winner, 
                rewardTokenIDs: [rewardTokenID],
                extraData: {}
            )
            self.winners[winner] = winnerRecord

            self.candidates.remove(at: winnerIndex)
            self.nftToBeDrawn.remove(at: rewardIndex)

            emit RaffleWinnerDrawn(
                raffleID: self.raffleID, 
                name: self.name, 
                host: self.host, 
                winner: winner, 
                nftIdentifier: self.nftInfo.nftIdentifier, 
                tokenIDs: [rewardTokenID]
            )
        }

        pub fun batchDraw() {
            assert(self.candidates.length > 0, message: "no candidates")
            assert(self.nftToBeDrawn.length >= self.candidates.length, message: "nft is not enough")

            let availability = self.checkAvailability(params: params)
            assert(availability.status == RaffleAvailabilityStatus.drawing, message: availability.getStatus())

            let availableCapacity = self.numberOfWinners - self.winners.keys.length
            assert(self.candidates.length >= availableCapacity, message: "no enough candidates")

            while self.winners.keys.length < numberOfwinners {
                let winnerIndex = unsafeRandom() % self.candidates.length
                let rewardIndex = unsafeRandom() % self.nftToBeDrawn.length
                rewardTokenID = self.nftToBeDrawn[rewardIndex]

                assert(self.winners[winner] == nil, message: "winner already recorded")

                let winnerRecord = WinnerRecord(
                    address: winner, 
                    rewardTokenIDs: [rewardTokenID],
                    extraData: {}
                )
                self.winners[winner] = winnerRecord

                self.candidates.remove(at: winnerIndex)
                self.nftToBeDrawn.remove(at: rewardIndex)
            }
        }

        // private methods

        pub fun togglePause(): Bool {
            pre { 
                !self.isEnded: "Raffle has ended" 
            }

            self.isPaused = !self.isPaused
            return self.isPaused
        }

        // deposit more NFT into the Raffle
        pub fun deposit(token: @NonFungibleToken.NFT) {
            pre {
                !self.isEnded: "Raffle has ended"
            }

            self.collection.deposit(token: <- token)
            self.rewards.append(token.id)
        }

        pub fun withdrawAllNFTs(receiver: &{NonFungibleToken.Receiver}) {
            self.isPaused = true
            let tokenIDs = self.collection.getIDs()
            for tokenID in tokenIDs {
                let token <- self.collection.withdraw(withdrawID: tokenID)
                receiver.deposit(token: <- token)
            }
        }

        pub fun end(receiver: &{NonFungibleToken.Receiver}) {
            self.withdrawAllNFTs(receiver: receiver)
            self.isEnded = true
        }

        init(
            name: String,
            description: String,
            host: Address,
            image: String?,
            url: String?,
            startAt: UFix64?,
            endAt: UFix64?,
            registerEndAt: UFix64, 
            numberOfwinners: UInt8,
            nftInfo: NFTInfo,
            collection: @NonFungibleToken.Collection,
            registerationVerifyMode: Drizzle.EligibilityVerifyMode,
            claimVerifyMode: Drizzle.EligibilityVerifyMode,
            registerationVerifiers: {String: [Drizzle.IEligibilityVerifier]},
            claimVerifiers: {String: [{Drizzle.IEligibilityVerifier}]},
            extraData: {String: AnyStruct} 
        ) {
            let collectionType = CompositeType(nftInfo.collectionIdentifier)!
            if !collection.isInstance(collectionType) {
                panic("invalid nft info: get ".concat(collection.getType().identifier)
                .concat(", want ").concat(collectionType.identifier))
            }

            let rewardIDs = collection.getIDs()
            assert(rewardIDs.length >= numberOfWinners, message: 
                rewardIDs.length.toString()
                .cancat(" NFT is not enough for ")
                .concat(numberOfWinners.toString())
                .concat(" winners"))

            if let _startAt = startAt {
                if let _endAt = endAt {
                    assert(_startAt < _endAt, message: "endAt should greater than startAt")
                    assert(registerEndAt < _endAt, message: "registerEndAt should smaller than endAt")
                }
                assert(registerEndAt > _startAt, message: "registerEndAt should greater than startAt")
            }

            self.raffleID = self.uuid
            self.name = name
            self.description = description
            self.createdAt = getCurrentBlock().timestamp
            self.host = host
            self.image = image
            self.url = url

            self.startAt = startAt
            self.endAt = endAt

            self.registerEndAt = registerEndAt
            self.numberOfWinners = numberOfWinners

            self.nftInfo = nftInfo
            self.collection <- collection

            self.registerationVerifyMode = registerationVerifyMode
            self.claimVerifyMode = claimVerifyMode
            self.registerationVerifiers = registerationVerifiers
            self.claimVerifiers = claimVerifiers

            self.extraData = extraData

            self.isPaused = false
            self.isEnded = false

            self.registeredRecords = {}
            self.candidates = {}
            self.winners = {}
            self.nftToBeDrawn = rewardIDs
            self.rewards = rewardIDs

            emit RaffleCreated(
                raffleID: self.raffleID, 
                name: self.name, 
                host: self.host, 
                description: self.description, 
                nftIdentifier: self.nftInfo.nftIdentifier 
            )
        }

        destroy() {
            pre {
                self.collection.getIDs().length == 0: "collection is not empty, please withdraw all NFTs before delete Raffle"
            }

            destroy self.collection
            emit RaffleDestroyed(raffleID: self.raffleID, name: self.name, host: self.host)
        }
    }

    pub resource interface IMistPauser {
        pub fun toggleContractPause(): Bool
    }

    pub resource Admin: IMistPauser {
        // Use to pause the creation of new DROP
        // If we want to migrate the contracts, we can make sure no more DROP in old contracts be created.
        pub fun toggleContractPause(): Bool {
            Mist.isPaused = !Mist.isPaused
            return Mist.isPaused
        }
    }

    pub resource NFTRaffleCollection {
        pub var raffles: @{UInt64: NFTRaffle}

        pub fun createRaffle(
            name: String,
            description: String,
            host: Address,
            image: String?,
            url: String?,
            startAt: UFix64?,
            endAt: UFix64?,
            registerEndAt: UFix64, 
            numberOfwinners: UInt8,
            nftInfo: NFTInfo,
            collection: @NonFungibleToken.Collection,
            registerationVerifyMode: Drizzle.EligibilityVerifyMode,
            claimVerifyMode: Drizzle.EligibilityVerifyMode,
            registerationVerifiers: [{Drizzle.IEligibilityVerifier}],
            claimVerifiers: [{Drizzle.IEligibilityVerifier}],
            extraData: {String: AnyStruct} 
        ) {
            pre {
                registerationVerifyMode.length <= 1: "Currently only 0 or 1 registeration verifier supported"
                claimVerifiers.length <= 1: "Currently only 0 or 1 registeration verifier supported"
                !Mist.isPaused: "Mist contract is paused!"
            }

            let typedRegisterationVerifiers: {String: [{Drizzle.IEligibilityVerifier}]} = {}
            for verifier in registerationVerifiers {
                let identifier = verifier.getType().identifier
                if typedRegisterationVerifiers[identifier] == nil {
                    typedRegisterationVerifiers[identifier] = [verifier]
                } else {
                    typedRegisterationVerifiers[identifier]!.append(verifier)
                }
            }

            let typedClaimVerifiers: {String: [{Drizzle.IEligibilityVerifier}]} = {}
            for verifier in claimVerifiers {
                let identifier = verifier.getType().identifier
                if typedClaimVerifiers[identifier] == nil {
                    typedClaimVerifiers[identifier] = [verifier]
                } else {
                    typedClaimVerifiers[identifier]!.append(verifier)
                }
            }

            let raffle <- create NFTRaffle(
                name: name,
                description: description,
                host: host,
                image: image,
                url: url,
                startAt: startAt,
                endAt: endAt,
                registerEndAt: registerEndAt,
                numberOfWinners: numberOfWinners,
                nftInfo: nftInfo,
                collection: <- collection,
                registerationVerifyMode: registerationVerifyMode,
                claimVerifyMode: claimVerifyMode,
                registerationVerifiers: registerationVerifiers,
                claimVerifiers: claimVerifiers,
                extraData: extraData
            )

            let raffleID = raffle.raffleID

            self.raffles[raffleID] <-! raffle
            return raffleID
        }
    }

    pub fun createEmptyNFTRaffleCollection(): @NFTRaffleCollection {
        return <- create NFTRaffleCollection()
    }

    pub var isPaused: Bool
    pub var totalRaffles: UInt64

    init() {

    }
}