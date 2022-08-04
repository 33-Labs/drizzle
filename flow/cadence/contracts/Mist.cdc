import NonFungibleToken from "./core/NonFungibleToken.cdc"
import MetadataViews from "./core/MetadataViews.cdc"
import EligibilityVerifiers from "./EligibilityVerifiers.cdc"

pub contract Mist {
    pub let MistAdminStoragePath: StoragePath
    pub let MistAdminPublicPath: PublicPath
    pub let MistAdminPrivatePath: PrivatePath

    pub let RaffleCollectionStoragePath: StoragePath
    pub let RaffleCollectionPublicPath: PublicPath
    pub let RaffleCollectionPrivatePath: PrivatePath

    pub event ContractInitialized()

    pub event RaffleCreated(raffleID: UInt64, name: String, host: Address, description: String, nftIdentifier: String)
    pub event RaffleRegistered(raffleID: UInt64, name: String, host: Address, registrator: Address, nftIdentifier: String)
    pub event RaffleWinnerDrawn(raffleID: UInt64, name: String, host: Address, winner: Address, nftIdentifier: String, tokenIDs: [UInt64])
    pub event RaffleClaimed(raffleID: UInt64, name: String, host: Address, claimer: Address, nftIdentifier: String, tokenIDs: [UInt64])
    pub event RafflePaused(raffleID: UInt64, name: String, host: Address)
    pub event RaffleUnpaused(raffleID: UInt64, name: String, host: Address)
    pub event RaffleEnded(raffleID: UInt64, name: String, host: Address)
    pub event RaffleDestroyed(raffleID: UInt64, name: String, host: Address)

    pub enum AvailabilityStatus: UInt8 {
        pub case notStartYet
        pub case ended
        pub case registering
        pub case drawing
        pub case drawn
        pub case expired
        pub case paused
    }

    pub struct Availability {
        pub let status: AvailabilityStatus
        pub let extraData: {String: AnyStruct}

        init(status: AvailabilityStatus, extraData: {String: AnyStruct}) {
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

    pub enum EligibilityStatus: UInt8 {
        pub case eligibleForRegistering
        pub case eligibleForClaiming

        pub case notEligibleForRegistering
        pub case notEligibleForClaiming

        pub case hasRegistered
        pub case hasClaimed
    }

    pub struct Eligibility {
        pub let status: EligibilityStatus
        pub let eligibleNFTs: [UInt64]
        pub let extraData: {String: AnyStruct}

        init(
            status: EligibilityStatus, 
            eligibleNFTs: [UInt64],
            extraData: {String: AnyStruct}) {
            self.status = status
            self.eligibleNFTs = eligibleNFTs
            self.extraData = extraData
        }

        pub fun getStatus(): String {
            switch self.status {
            case EligibilityStatus.eligibleForRegistering: 
                return "eligible for registering"
            case EligibilityStatus.eligibleForClaiming:
                return "eligible for claiming"
            case EligibilityStatus.notEligibleForRegistering:
                return "not eligible for registering"
            case EligibilityStatus.notEligibleForClaiming:
                return "not eligible for claiming"
            case EligibilityStatus.hasRegistered:
                return "has registered"
            case EligibilityStatus.hasClaimed:
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

        access(contract) fun markAsClaimed() {
            self.isClaimed = true
        }

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
        pub let nftCatalogCollectionID: String
        pub let collectionIdentifier: String
        pub let contractName : String

        pub let contractAddress : Address
        pub let displayName: String

        pub let storagePath : StoragePath
        pub let publicPath : PublicPath

        init(
            nftCatalogCollectionID: String,
            contractName: String,
            contractAddress: Address,
            displayName: String,
            storagePath: StoragePath,
            publicPath: PublicPath
        ) {
            let address = contractAddress.toString()
            let addrTrimmed = address.slice(from: 2, upTo: address.length)

            let contractIdentifier = "A.".concat(addrTrimmed).concat(".").concat(contractName)
            self.nftCatalogCollectionID = nftCatalogCollectionID
            self.nftIdentifier = contractIdentifier.concat(".NFT")
            self.collectionIdentifier = contractIdentifier.concat(".Collection")

            self.contractAddress = contractAddress
            self.contractName = contractName
            self.displayName = displayName

            self.storagePath = storagePath
            self.publicPath = publicPath
        }
    }

    pub resource interface IRafflePublic {
        pub let raffleID: UInt64
        pub let name: String
        pub let description: String
        pub let host: Address
        pub let createdAt: UFix64
        pub let image: String?
        pub let url: String?
        pub let startAt: UFix64?
        pub let endAt: UFix64?

        pub let registeryEndAt: UFix64
        pub let numberOfWinners: UInt64

        pub let nftInfo: NFTInfo

        pub let registrationVerifyMode: EligibilityVerifiers.VerifyMode
        pub let claimVerifyMode: EligibilityVerifiers.VerifyMode

        pub var isPaused: Bool
        pub var isEnded: Bool

        pub let extraData: {String: AnyStruct}

        pub fun register(account: Address, params: {String: AnyStruct})
        pub fun hasRegistered(account: Address): Bool
        pub fun getRegistrationRecords(): {Address: RegistrationRecord}
        pub fun getRegistrationRecord(account: Address): RegistrationRecord?

        pub fun getWinners(): {Address: WinnerRecord}
        pub fun getWinner(account: Address): WinnerRecord?

        pub fun claim(receiver: &{NonFungibleToken.CollectionPublic}, params: {String: AnyStruct})
        pub fun checkAvailability(params: {String: AnyStruct}): Availability
        pub fun checkRegistrationEligibility(account: Address, params: {String: AnyStruct}): Eligibility
        pub fun checkClaimEligibility(account: Address, params: {String: AnyStruct}): Eligibility

        pub fun getRegistrationVerifiers(): {String: [{EligibilityVerifiers.IEligibilityVerifier}]}
        pub fun getClaimVerifiers(): {String: [{EligibilityVerifiers.IEligibilityVerifier}]}
        
        pub fun getRewardDisplays(): {UInt64: MetadataViews.Display}
    }

    pub resource Raffle: IRafflePublic {
        pub let raffleID: UInt64
        pub let name: String
        pub let description: String
        pub let host: Address
        pub let createdAt: UFix64
        pub let image: String?
        pub let url: String?
        pub let startAt: UFix64?
        pub let endAt: UFix64?

        pub let registeryEndAt: UFix64
        pub let numberOfWinners: UInt64

        pub let nftInfo: NFTInfo

        pub let registrationVerifyMode: EligibilityVerifiers.VerifyMode
        pub let claimVerifyMode: EligibilityVerifiers.VerifyMode

        pub var isPaused: Bool
        pub var isEnded: Bool

        pub let extraData: {String: AnyStruct}

        access(account) let registrationVerifiers: {String: [{EligibilityVerifiers.IEligibilityVerifier}]}
        access(account) let claimVerifiers: {String: [{EligibilityVerifiers.IEligibilityVerifier}]}
        access(self) let collection: @NonFungibleToken.Collection
        access(self) let registrationRecords: {Address: RegistrationRecord}
        access(self) let winners: {Address: WinnerRecord}
        access(self) let candidates: [Address]
        access(self) let nftToBeDrawn: [UInt64]
        access(self) let rewardDisplays: {UInt64: MetadataViews.Display}

        pub fun register(account: Address, params: {String: AnyStruct}) {
            let availability = self.checkAvailability(params: params)
            assert(availability.status == AvailabilityStatus.registering, message: availability.getStatus())

            let eligibility = self.checkRegistrationEligibility(account: account, params: params)
            assert(eligibility.status == EligibilityStatus.eligibleForRegistering, message: eligibility.getStatus())

            emit RaffleRegistered(
                raffleID: self.raffleID, 
                name: self.name, 
                host: self.host, 
                registrator: account, 
                nftIdentifier: self.nftInfo.nftIdentifier 
            )

            self.registrationRecords[account] = RegistrationRecord(address: account, extraData: {})
            self.candidates.append(account)
        }

        pub fun hasRegistered(account: Address): Bool {
            return self.registrationRecords[account] != nil
        }

        pub fun getRegistrationRecords(): {Address: RegistrationRecord} {
            return self.registrationRecords
        }

        pub fun getRegistrationRecord(account: Address): RegistrationRecord? {
            return self.registrationRecords[account]
        }

        pub fun getWinners(): {Address: WinnerRecord} {
            return self.winners
        }

        pub fun getWinner(account: Address): WinnerRecord? {
            return self.winners[account]
        }

        pub fun claim(receiver: &{NonFungibleToken.CollectionPublic}, params: {String: AnyStruct}) {
            let availability = self.checkAvailability(params: params)
            assert(availability.status == AvailabilityStatus.drawn || availability.status == AvailabilityStatus.drawing, message: availability.getStatus())

            let claimer = receiver.owner!.address
            let eligibility = self.checkClaimEligibility(account: claimer, params: params)
            assert(eligibility.status == EligibilityStatus.eligibleForClaiming, message: eligibility.getStatus())

            self.winners[claimer]!.markAsClaimed()
            let winnerRecord = self.winners[claimer]!

            emit RaffleClaimed(
                raffleID: self.raffleID, 
                name: self.name, 
                host: self.host, 
                claimer: claimer, 
                nftIdentifier: self.nftInfo.nftIdentifier, 
                tokenIDs: winnerRecord.rewardTokenIDs
            )

            for tokenID in winnerRecord.rewardTokenIDs {
                let nft <- self.collection.withdraw(withdrawID: tokenID)
                receiver.deposit(token: <- nft)
            }
        }

        pub fun checkAvailability(params: {String: AnyStruct}): Availability {
            if self.isEnded {
                return Availability(
                    status: AvailabilityStatus.ended, 
                    extraData: {}
                )
            }

            if let startAt = self.startAt {
                if getCurrentBlock().timestamp < startAt {
                    return Availability(
                        status: AvailabilityStatus.notStartYet,
                        extraData: {}
                    )
                }
            }

            if let endAt = self.endAt {
                if getCurrentBlock().timestamp > endAt {
                    return Availability(
                        status: AvailabilityStatus.expired,
                        extraData: {}
                    )
                }
            }

            if self.isPaused {
                return Availability(
                    status: AvailabilityStatus.paused,
                    extraData: {}
                ) 
            }

            assert(UInt64(self.winners.keys.length) <= self.numberOfWinners, message: "invalid winners")

            // can't register but claiming is available
            if UInt64(self.winners.keys.length) == self.numberOfWinners {
                return Availability(
                    status: AvailabilityStatus.drawn,
                    extraData: {}
                )
            }

            // can't register and claim
            if getCurrentBlock().timestamp > self.registeryEndAt {
                return Availability(
                    status: AvailabilityStatus.drawing,
                    extraData: {} 
                )
            }

            return Availability(
                status: AvailabilityStatus.registering,
                extraData: {}
            )
        }

        pub fun checkRegistrationEligibility(account: Address, params: {String: AnyStruct}): Eligibility {
            if let record = self.registrationRecords[account] {
                return Eligibility(
                    status: EligibilityStatus.hasRegistered,
                    eligibleNFTs: [],
                    extraData: {}
                )
            }

            let isEligible = self.isEligible(
                account: account,
                mode: self.registrationVerifyMode,
                verifiers: self.registrationVerifiers,
                params: params
            ) 

            return Eligibility(
                status: isEligible ? 
                    EligibilityStatus.eligibleForRegistering : 
                    EligibilityStatus.notEligibleForRegistering,
                eligibleNFTs: [],
                extraData: {}
            )
        }

        pub fun checkClaimEligibility(account: Address, params: {String: AnyStruct}): Eligibility {
            if self.winners[account] == nil {
                return Eligibility(
                    status: EligibilityStatus.notEligibleForClaiming,
                    eligibleNFTs: [],
                    extraData: {}
                )
            }

            let record = self.winners[account]!
            if record.isClaimed {
                return Eligibility(
                    status: EligibilityStatus.hasClaimed,
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

            return Eligibility(
                status: isEligible ? 
                    EligibilityStatus.eligibleForClaiming: 
                    EligibilityStatus.eligibleForClaiming,
                eligibleNFTs: record.rewardTokenIDs,
                extraData: {}
            ) 
        }

        pub fun getRegistrationVerifiers(): {String: [{EligibilityVerifiers.IEligibilityVerifier}]} {
            return self.registrationVerifiers
        }

        pub fun getClaimVerifiers(): {String: [{EligibilityVerifiers.IEligibilityVerifier}]} {
            return self.claimVerifiers
        }

        pub fun getRewardDisplays(): {UInt64: MetadataViews.Display} {
            return self.rewardDisplays
        }

        access(self) fun isEligible(
            account: Address,
            mode: EligibilityVerifiers.VerifyMode, 
            verifiers: {String: [{EligibilityVerifiers.IEligibilityVerifier}]},
            params: {String: AnyStruct}
        ): Bool {
            params.insert(key: "claimer", account)
            if mode == EligibilityVerifiers.VerifyMode.oneOf {
                for identifier in verifiers.keys {
                    let verifiers = verifiers[identifier]!
                    for verifier in verifiers {
                        if verifier.verify(account: account, params: params).isEligible {
                            return true
                        }
                    }
                }
                return false
            } 
            
            if mode == EligibilityVerifiers.VerifyMode.all {
                for identifier in verifiers.keys {
                    let verifiers = verifiers[identifier]!
                    for verifier in verifiers {
                        if !verifier.verify(account: account, params: params).isEligible {
                            return false
                        }
                    }
                }
                return true
            }
            panic("invalid mode: ".concat(mode.rawValue.toString()))
        }

        pub fun draw(params: {String: AnyStruct}) {
            assert(self.candidates.length > 0, message: "no candidates")
            assert(self.nftToBeDrawn.length >= self.candidates.length, message: "nft is not enough")

            let availability = self.checkAvailability(params: params)
            assert(availability.status == AvailabilityStatus.drawing, message: availability.getStatus())

            let winnerIndex = unsafeRandom() % UInt64(self.candidates.length)
            let winner = self.candidates[winnerIndex]

            let rewardIndex = unsafeRandom() % UInt64(self.nftToBeDrawn.length)
            let rewardTokenID = self.nftToBeDrawn[rewardIndex]

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

        pub fun batchDraw(params: {String: AnyStruct}) {
            assert(UInt64(self.candidates.length) > 0, message: "no candidates")
            assert(self.nftToBeDrawn.length >= self.candidates.length, message: "nft is not enough")

            let availability = self.checkAvailability(params: params)
            assert(availability.status == AvailabilityStatus.drawing, message: availability.getStatus())

            let availableCapacity = self.numberOfWinners - UInt64(self.winners.keys.length)
            assert(UInt64(self.candidates.length) >= availableCapacity, message: "no enough candidates")

            while UInt64(self.winners.keys.length) < self.numberOfWinners {
                let winnerIndex = unsafeRandom() % UInt64(self.candidates.length)
                let winner = self.candidates[winnerIndex]

                let rewardIndex = unsafeRandom() % UInt64(self.nftToBeDrawn.length)
                let rewardTokenID = self.nftToBeDrawn[rewardIndex]

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
            if self.isPaused {
                emit RafflePaused(raffleID: self.raffleID, name: self.name, host: self.host)
            } else {
                emit RaffleUnpaused(raffleID: self.raffleID, name: self.name, host: self.host)
            }
            return self.isPaused
        }

        // deposit more NFT into the Raffle
        pub fun deposit(token: @NonFungibleToken.NFT, display: MetadataViews.Display) {
            pre {
                !self.isEnded: "Raffle has ended"
            }

            let tokenID = token.id
            self.collection.deposit(token: <- token)
            self.nftToBeDrawn.append(tokenID)
            self.rewardDisplays[tokenID] = display
        }

        pub fun end(receiver: &{NonFungibleToken.CollectionPublic}) {
            self.isEnded = true
            self.isPaused = true
            emit RaffleEnded(raffleID: self.raffleID, name: self.name, host: self.host)
            let tokenIDs = self.collection.getIDs()
            for tokenID in tokenIDs {
                let token <- self.collection.withdraw(withdrawID: tokenID)
                receiver.deposit(token: <- token)
            }
        }

        init(
            name: String,
            description: String,
            host: Address,
            image: String?,
            url: String?,
            startAt: UFix64?,
            endAt: UFix64?,
            registeryEndAt: UFix64, 
            numberOfWinners: UInt64,
            nftInfo: NFTInfo,
            collection: @NonFungibleToken.Collection,
            registrationVerifyMode: EligibilityVerifiers.VerifyMode,
            claimVerifyMode: EligibilityVerifiers.VerifyMode,
            registrationVerifiers: {String: [{EligibilityVerifiers.IEligibilityVerifier}]},
            claimVerifiers: {String: [{EligibilityVerifiers.IEligibilityVerifier}]},
            extraData: {String: AnyStruct} 
        ) {
            let collectionType = CompositeType(nftInfo.collectionIdentifier)!
            if !collection.isInstance(collectionType) {
                panic("invalid nft info: get ".concat(collection.getType().identifier)
                .concat(", want ").concat(collectionType.identifier))
            }

            // let rewardIDs = collection.getIDs()
            // assert(UInt64(rewardIDs.length) >= numberOfWinners, message: 
            //     rewardIDs.length.toString()
            //     .concat(" NFT is not enough for ")
            //     .concat(numberOfWinners.toString())
            //     .concat(" winners"))

            if let _startAt = startAt {
                if let _endAt = endAt {
                    assert(_startAt < _endAt, message: "endAt should greater than startAt")
                    assert(registeryEndAt < _endAt, message: "registeryEndAt should smaller than endAt")
                }
                assert(registeryEndAt > _startAt, message: "registeryEndAt should greater than startAt")
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

            self.registeryEndAt = registeryEndAt
            self.numberOfWinners = numberOfWinners

            self.nftInfo = nftInfo
            self.collection <- collection

            self.registrationVerifyMode = registrationVerifyMode
            self.claimVerifyMode = claimVerifyMode
            self.registrationVerifiers = registrationVerifiers
            self.claimVerifiers = claimVerifiers

            self.extraData = extraData

            self.isPaused = false
            self.isEnded = false

            self.registrationRecords = {}
            self.candidates = []
            self.winners = {}
            self.nftToBeDrawn = []
            self.rewardDisplays = {}

            Mist.totalRaffles = Mist.totalRaffles + 1
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

    pub resource interface IRaffleCollectionPublic {
        pub fun getAllRaffles(): {UInt64: &{IRafflePublic}}
        pub fun borrowPublicRaffleRef(raffleID: UInt64): &{IRafflePublic}?
    }

    pub resource RaffleCollection: IRaffleCollectionPublic {
        pub var raffles: @{UInt64: Raffle}

        pub fun createRaffle(
            name: String,
            description: String,
            host: Address,
            image: String?,
            url: String?,
            startAt: UFix64?,
            endAt: UFix64?,
            registeryEndAt: UFix64, 
            numberOfWinners: UInt64,
            nftInfo: NFTInfo,
            collection: @NonFungibleToken.Collection,
            registrationVerifyMode: EligibilityVerifiers.VerifyMode,
            claimVerifyMode: EligibilityVerifiers.VerifyMode,
            registrationVerifiers: [{EligibilityVerifiers.IEligibilityVerifier}],
            claimVerifiers: [{EligibilityVerifiers.IEligibilityVerifier}],
            extraData: {String: AnyStruct} 
        ): UInt64 {
            pre {
                registrationVerifiers.length <= 1: "Currently only 0 or 1 registration verifier supported"
                claimVerifiers.length <= 1: "Currently only 0 or 1 registration verifier supported"
                !Mist.isPaused: "Mist contract is paused!"
            }

            let typedRegistrationVerifiers: {String: [{EligibilityVerifiers.IEligibilityVerifier}]} = {}
            for verifier in registrationVerifiers {
                let identifier = verifier.getType().identifier
                if typedRegistrationVerifiers[identifier] == nil {
                    typedRegistrationVerifiers[identifier] = [verifier]
                } else {
                    typedRegistrationVerifiers[identifier]!.append(verifier)
                }
            }

            let typedClaimVerifiers: {String: [{EligibilityVerifiers.IEligibilityVerifier}]} = {}
            for verifier in claimVerifiers {
                let identifier = verifier.getType().identifier
                if typedClaimVerifiers[identifier] == nil {
                    typedClaimVerifiers[identifier] = [verifier]
                } else {
                    typedClaimVerifiers[identifier]!.append(verifier)
                }
            }

            let raffle <- create Raffle(
                name: name,
                description: description,
                host: host,
                image: image,
                url: url,
                startAt: startAt,
                endAt: endAt,
                registeryEndAt: registeryEndAt,
                numberOfWinners: numberOfWinners,
                nftInfo: nftInfo,
                collection: <- collection,
                registrationVerifyMode: registrationVerifyMode,
                claimVerifyMode: claimVerifyMode,
                registrationVerifiers: typedRegistrationVerifiers,
                claimVerifiers: typedClaimVerifiers,
                extraData: extraData
            )

            let raffleID = raffle.raffleID

            self.raffles[raffleID] <-! raffle
            return raffleID
        }

        pub fun getAllRaffles(): {UInt64: &{IRafflePublic}} {
            let raffleRefs: {UInt64: &{IRafflePublic}} = {}

            for raffleID in self.raffles.keys {
                let raffleRef = (&self.raffles[raffleID] as &{IRafflePublic}?)!
                raffleRefs.insert(key: raffleID, raffleRef)
            }

            return raffleRefs
        }

        pub fun borrowPublicRaffleRef(raffleID: UInt64): &{IRafflePublic}? {
            return &self.raffles[raffleID] as &{IRafflePublic}?
        }

        pub fun borrowRaffleRef(raffleID: UInt64): &Raffle? {
            return &self.raffles[raffleID] as &Raffle?
        }

        pub fun deleteRaffle(raffleID: UInt64, receiver: &{NonFungibleToken.CollectionPublic}) {
            let raffle <- self.raffles.remove(key: raffleID) ?? panic("This raffle does not exist")
            raffle.end(receiver: receiver)
            destroy raffle
        }

        init() {
            self.raffles <- {}
        }

        destroy() {
            destroy self.raffles
        }
    }

    pub fun createEmptyRaffleCollection(): @RaffleCollection {
        return <- create RaffleCollection()
    }

    pub var isPaused: Bool
    pub var totalRaffles: UInt64

    init() {
        self.RaffleCollectionStoragePath = /storage/drizzleRaffleCollection
        self.RaffleCollectionPublicPath = /public/drizzleRaffleCollection
        self.RaffleCollectionPrivatePath = /private/drizzleRaffleCollection

        self.MistAdminStoragePath = /storage/drizzleMistAdmin
        self.MistAdminPublicPath = /public/drizzleMistAdmin
        self.MistAdminPrivatePath = /private/drizzleMistAdmin

        self.isPaused = false
        self.totalRaffles = 0

        self.account.save(<- create Admin(), to: self.MistAdminStoragePath)

        emit ContractInitialized()
    }
}