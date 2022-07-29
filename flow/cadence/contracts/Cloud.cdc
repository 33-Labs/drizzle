// Made by Lanford33

// Cloud.cdc defines the FungibleToken DROP and the collections of it.

import Drizzle from "./Drizzle.cdc"
import FungibleToken from "./core/FungibleToken.cdc"
import Distributors from "./Distributors.cdc"

pub contract Cloud {
    pub let CloudAdminStoragePath: StoragePath
    pub let CloudAdminPublicPath: PublicPath
    pub let CloudAdminPrivatePath: PrivatePath

    pub let DropCollectionStoragePath: StoragePath
    pub let DropCollectionPublicPath: PublicPath
    pub let DropCollectionPrivatePath: PrivatePath

    pub event ContractInitialized()

    pub event DropClaimed(dropID: UInt64, name: String, host: Address, claimer: Address, tokenIdentifier: String, amount: UFix64)
    pub event DropCreated(dropID: UInt64, name: String, host: Address, description: String, tokenIdentifier: String)
    pub event DropDestroyed(dropID: UInt64, name: String, host: Address)

    pub resource Drop: Drizzle.IDropPublic {
        pub let dropID: UInt64
        pub let name: String
        pub let description: String
        pub let host: Address
        pub let createdAt: UFix64
        pub let image: String?
        pub let url: String?

        pub let startAt: UFix64?
        pub let endAt: UFix64?

        pub let tokenInfo: Drizzle.TokenInfo

        pub let distributor: {Drizzle.IDistributor}
        pub let verifyMode: Drizzle.EligibilityVerifyMode

        pub var isPaused: Bool
        pub var isEnded: Bool
        pub let claimedRecords: {Address: Drizzle.ClaimRecord}
        pub var claimedAmount: UFix64
        pub let extraData: {String: AnyStruct}

        access(account) let verifiers: {String: [{Drizzle.IEligibilityVerifier}]}
        access(self) let dropVault: @FungibleToken.Vault

        pub fun claim(receiver: &{FungibleToken.Receiver}, params: {String: AnyStruct}) {
            let availability = self.checkAvailability(params: params)
            assert(availability.status == Drizzle.AvailabilityStatus.ok, message: availability.getStatus())

            let claimer = receiver.owner!.address
            let eligibility = self.checkEligibility(account: claimer, params: params)

            assert(eligibility.status == Drizzle.EligibilityStatus.eligible, message: eligibility.getStatus())

            let claimRecord = Drizzle.ClaimRecord(
                address: claimer,
                amount: eligibility.eligibleAmount,
                extraData: {}
            )

            self.claimedRecords.insert(key: claimRecord.address, claimRecord)
            self.claimedAmount = self.claimedAmount + claimRecord.amount

            emit DropClaimed(
                dropID: self.dropID,
                name: self.name,
                host: self.host,
                claimer: claimRecord.address,
                tokenIdentifier: self.tokenInfo.tokenIdentifier,
                amount: claimRecord.amount
            )

            let v <- self.dropVault.withdraw(amount: claimRecord.amount)
            receiver.deposit(from: <- v)
        }

        pub fun checkAvailability(params: {String: AnyStruct}): Drizzle.Availability {
            if self.isEnded {
                return Drizzle.Availability(
                    status: Drizzle.AvailabilityStatus.ended,
                    extraData: {}
                )
            }

            if let startAt = self.startAt {
                if getCurrentBlock().timestamp < startAt {
                    return Drizzle.Availability(
                        status: Drizzle.AvailabilityStatus.notStartYet,
                        extraData: {}
                    )
                }
            }

            if let endAt = self.endAt {
                if getCurrentBlock().timestamp > endAt {
                    return Drizzle.Availability(
                        status: Drizzle.AvailabilityStatus.expired,
                        extraData: {}
                    )
                }
            }

            let newParams: {String: AnyStruct} = self.combinedParams(params: params)
            if !self.distributor.isAvailable(params: newParams) {
                return Drizzle.Availability(
                    status: Drizzle.AvailabilityStatus.noCapacity,
                    extraData: {}
                )
            }

            if self.isPaused {
                return Drizzle.Availability(
                    status: Drizzle.AvailabilityStatus.paused,
                    extraData: {}
                ) 
            }

            return Drizzle.Availability(
                status: Drizzle.AvailabilityStatus.ok,
                extraData: {}
            ) 
        }

        pub fun checkEligibility(account: Address, params: {String: AnyStruct}): Drizzle.Eligibility {
            if let record = self.claimedRecords[account] {
                return Drizzle.Eligibility(
                    status: Drizzle.EligibilityStatus.hasClaimed,
                    eligibleAmount: record.amount,
                    extraData: {}
                )
            } 

            params.insert(key: "claimer", account)
            let newParams: {String: AnyStruct} = self.combinedParams(params: params)
            var isEligible = false
            if self.verifyMode == Drizzle.EligibilityVerifyMode.oneOf {
                for identifier in self.verifiers.keys {
                    let verifiers = self.verifiers[identifier]!
                    for verifier in verifiers {
                        if verifier.verify(account: account, params: newParams).isEligible {
                            isEligible = true
                            break
                        }
                    }
                    if isEligible {
                        break
                    }
                }
            } else if self.verifyMode == Drizzle.EligibilityVerifyMode.all {
                isEligible = true
                for identifier in self.verifiers.keys {
                    let verifiers = self.verifiers[identifier]!
                    for verifier in verifiers {
                        if !verifier.verify(account: account, params: newParams).isEligible {
                            isEligible = false
                            break
                        }
                    }
                    if !isEligible {
                        break
                    }
                }
            }

            let eligibleAmount = self.distributor.getEligibleAmount(params: newParams)

            return Drizzle.Eligibility(
                isEligible: isEligible ? Drizzle.EligibilityStatus.eligible : Drizzle.EligibilityStatus.notEligible,
                eligibleAmount: eligibleAmount,
                extraData: {}
            )
        }

        pub fun getClaimedRecord(account: Address): Drizzle.ClaimRecord? {
            return self.claimedRecords[account]
        }

        pub fun getClaimedRecords(): {Address: Drizzle.ClaimRecord} {
            return self.claimedRecords
        }

        pub fun getDropBalance(): UFix64 {
            return self.dropVault.balance
        }

        pub fun getVerifiers(): {String: [{Drizzle.IEligibilityVerifier}]} {
            return self.verifiers
        }

        // private methods

        pub fun togglePause(): Bool {
            pre { 
                !self.isEnded: "DROP has ended" 
            }

            self.isPaused = !self.isPaused
            return self.isPaused
        }

        // deposit more token into the DROP.
        // If the whitelist of a DROP is allowed to extend, we need
        // this function to make sure the claimers can have enough funds to withdraw.
        pub fun deposit(from: @FungibleToken.Vault) {
            pre {
                !self.isEnded: "DROP has ended"
                from.balance > 0.0: "deposit empty vault"
            }

            self.dropVault.deposit(from: <- from)
        }

        // withdraw all funds in the DROP's vault.
        pub fun withdrawAllFunds(receiver: &{FungibleToken.Receiver}) {
            self.isPaused = true
            if self.dropVault.balance > 0.0 {
                let v <- self.dropVault.withdraw(amount: self.dropVault.balance)
                receiver.deposit(from: <- v)
            }
        }

        pub fun end(receiver: &{FungibleToken.Receiver}) {
            self.withdrawAllFunds(receiver: receiver)
            self.isEnded = true
        }

        access(self) fun combinedParams(params: {String: AnyStruct}): {String: AnyStruct} {
            let combined: {String: AnyStruct} = {
                "claimedCount": UInt32(self.claimedRecords.keys.length),
                "claimedAmount": self.claimedAmount
            }

            for key in params.keys {
                if !combined.containsKey(key) {
                    combined[key] = params[key]
                }
            }
            return combined
        }

        init(
            name: String,
            description: String,
            host: Address,
            image: String?,
            url: String?,
            startAt: UFix64?,
            endAt: UFix64?,
            tokenInfo: Drizzle.TokenInfo,
            distributor: {Drizzle.IDistributor},
            verifyMode: Drizzle.EligibilityVerifyMode,
            verifiers: {String: [{Drizzle.IEligibilityVerifier}]},
            vault: @FungibleToken.Vault,
            extraData: {String: AnyStruct}
        ) {
            pre {
                name.length > 0: "invalid name"
            }

            // `tokenInfo` should match with `vault`
            let tokenVaultType = CompositeType(tokenInfo.providerIdentifier)!
            if !vault.isInstance(tokenVaultType) {
                panic("invalid token info: get ".concat(vault.getType().identifier)
                .concat(", want ").concat(tokenVaultType.identifier))
            }

            if let _startAt = startAt {
                if let _endAt = endAt {
                    assert(_startAt < _endAt, message: "endAt should greater than startAt")
                }
            }

            self.dropID = self.uuid
            self.name = name
            self.description = description
            self.host = host
            self.createdAt = getCurrentBlock().timestamp
            self.image = image
            self.url = url

            self.startAt = startAt
            self.endAt = endAt

            self.tokenInfo = tokenInfo

            self.distributor = distributor
            self.verifyMode = verifyMode
            self.verifiers = verifiers

            self.isPaused = false
            self.isEnded = false
            self.claimedRecords = {}
            self.claimedAmount = 0.0

            self.dropVault <- vault
            self.extraData = extraData

            Cloud.totalDrops = Cloud.totalDrops + 1
            emit DropCreated(
                dropID: self.dropID,
                name: self.name,
                host: self.host,
                description: self.description,
                tokenIdentifier: self.tokenInfo.tokenIdentifier
            )
        }

        destroy() {
            pre {
                self.dropVault.balance == 0.0: "dropVault is not empty, please withdraw all funds before delete DROP"
            }

            destroy self.dropVault
            emit DropDestroyed(dropID: self.dropID, name: self.name, host: self.host)
        }
    }

    pub resource interface ICloudPauser {
        pub fun toggleContractPause(): Bool
    }

    pub resource Admin: ICloudPauser {
        // Use to pause the creation of new DROP
        // If we want to migrate the contracts, we can make sure no more DROP in old contracts be created.
        pub fun toggleContractPause(): Bool {
            Cloud.isPaused = !Cloud.isPaused
            return Cloud.isPaused
        }
    }

    pub resource DropCollection: Drizzle.IDropCollectionPublic {
        pub var drops: @{UInt64: Drop}

        pub fun createDrop(
            name: String,
            description: String,
            host: Address,
            image: String?,
            url: String?,
            startAt: UFix64?,
            endAt: UFix64?,
            tokenInfo: Drizzle.TokenInfo,
            distributor: {Drizzle.IDistributor},
            verifyMode: Drizzle.EligibilityVerifyMode,
            verifiers: [{Drizzle.IEligibilityVerifier}],
            vault: @FungibleToken.Vault,
            extraData: {String: AnyStruct}
        ): UInt64 {
            pre {
                verifiers.length == 1: "Currently only 1 verifier supported"
                !Cloud.isPaused: "Cloud contract is paused!"
            }

            let typedVerifiers: {String: [{Drizzle.IEligibilityVerifier}]} = {}
            for verifier in verifiers {
                let identifier = verifier.getType().identifier
                if typedVerifiers[identifier] == nil {
                    typedVerifiers[identifier] = [verifier]
                } else {
                    typedVerifiers[identifier]!.append(verifier)
                }
            }
            
            let drop <- create Drop(
                name: name, 
                description: description, 
                host: host,
                image: image,
                url: url,
                startAt: startAt,
                endAt: endAt,
                tokenInfo: tokenInfo,
                distributor: distributor,
                verifyMode: verifyMode,
                verifiers: typedVerifiers,
                vault: <- vault,
                extraData: extraData
            )

            let dropID = drop.dropID

            self.drops[dropID] <-! drop
            return dropID
        }

        pub fun getAllDrops(): {UInt64: &{Drizzle.IDropPublic}} {
            let dropRefs: {UInt64: &{Drizzle.IDropPublic}} = {}

            for dropID in self.drops.keys {
                let dropRef = (&self.drops[dropID] as &{Drizzle.IDropPublic}?)!
                dropRefs.insert(key: dropID, dropRef)
            }

            return dropRefs
        }

        pub fun borrowPublicDropRef(dropID: UInt64): &{Drizzle.IDropPublic}? {
            return &self.drops[dropID] as &{Drizzle.IDropPublic}?
        }

        pub fun borrowDropRef(dropID: UInt64): &Drop? {
            return &self.drops[dropID] as &Drop?
        }

        pub fun deleteDrop(dropID: UInt64, receiver: &{FungibleToken.Receiver}) {
            let drop <- self.drops.remove(key: dropID) ?? panic("This drop does not exist")
            drop.withdrawAllFunds(receiver: receiver)
            destroy drop
        }

        destroy() {
            destroy self.drops
        }

        init() {
            self.drops <- {}
        }
    }

    pub fun createEmptyDropCollection(): @DropCollection {
        return <- create DropCollection()
    }

    pub var isPaused: Bool
    pub var totalDrops: UInt64

    init() {
        self.DropCollectionStoragePath = /storage/drizzleDropCollectionStoragePath
        self.DropCollectionPublicPath = /public/drizzleDropCollectionPublicPath
        self.DropCollectionPrivatePath = /private/drizzleDropCollectionPrivatePath

        self.CloudAdminStoragePath = /storage/drizzleCloudAdminStoragePath
        self.CloudAdminPublicPath = /public/drizzleCloudPublicPath
        self.CloudAdminPrivatePath = /private/drizzleCloudPublicPath

        self.isPaused = false
        self.totalDrops = 0

        self.account.save(<- create Admin(), to: self.CloudAdminStoragePath)

        emit ContractInitialized()
    }
}