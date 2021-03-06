// Made by Lanford33

// Cloud.cdc defines the FungibleToken DROP and the collections of it.

import Drizzle from "./Drizzle.cdc"
import FungibleToken from "./core/FungibleToken.cdc"
import Packets from "./Packets.cdc"

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
        pub let eligibilityReviewer: {Drizzle.IEligibilityReviewer}

        pub var isPaused: Bool
        pub let claimedRecords: {Address: Drizzle.ClaimRecord}
        pub var claimedAmount: UFix64

        access(self) let dropVault: @FungibleToken.Vault

        pub fun claim(receiver: &{FungibleToken.Receiver}, params: {String: AnyStruct}) {
            let claimer = receiver.owner!.address
            let claimStatus = self.getClaimStatus(account: claimer)

            assert(claimStatus.code == Drizzle.ClaimStatusCode.ok, message: claimStatus.message)

            let claimRecord = Drizzle.ClaimRecord(
                address: claimer,
                amount: claimStatus.eligibleAmount,
                extraData: {}
            )

            self.claimedRecords.insert(key: claimRecord.address, claimRecord)
            self.claimedAmount = self.claimedAmount + claimRecord.amount

            let v <- self.dropVault.withdraw(amount: claimRecord.amount)
            receiver.deposit(from: <- v)

            emit DropClaimed(
                dropID: self.dropID,
                name: self.name,
                host: self.host,
                claimer: claimRecord.address,
                tokenIdentifier: self.tokenInfo.tokenIdentifier,
                amount: claimRecord.amount
            )
        }

        // NOTE: The order of these judgement does matter
        // NOTE: For Random Packet, the eligibleAmount is determined in `claim`, the amount
        // got in getClaimStatus is not the final amount.
        pub fun getClaimStatus(account: Address): Drizzle.ClaimStatus {
            let eligibility = self.eligibilityReviewer.checkEligibility(
                account: account, 
                params: {
                    "claimedCount": UInt32(self.claimedRecords.keys.length),
                    "claimedAmount": self.claimedAmount
                }
            )

            let extraData: {String: AnyStruct} = {}
            if let packet = self.eligibilityReviewer.packet {
                if packet.isInstance(Type<Packets.RandomPacket>()) {
                    extraData["note"] = "for RandomPacket, the actual eligibleAmount is determined in `claim`"
                }
            }

            if !eligibility.isEligible {
                return Drizzle.ClaimStatus(
                    code: Drizzle.ClaimStatusCode.ineligible,
                    eligibleAmount: 0.0,
                    message: "not eligible",
                    extraData: extraData
                )
            }

            if let record = self.claimedRecords[account] {
                return Drizzle.ClaimStatus(
                    code: Drizzle.ClaimStatusCode.claimed,
                    eligibleAmount: record.amount,
                    message: "claimed",
                    extraData: extraData
                )
            }

            if !eligibility.isAvailable {
                return Drizzle.ClaimStatus(
                    code: Drizzle.ClaimStatusCode.unavailable,
                    eligibleAmount: eligibility.eligibleAmount,
                    message: "no longer available",
                    extraData: extraData
                ) 
            }

            if let startAt = self.startAt {
                if getCurrentBlock().timestamp < startAt {
                    return Drizzle.ClaimStatus(
                        code: Drizzle.ClaimStatusCode.notStartYet,
                        eligibleAmount: eligibility.eligibleAmount,
                        message: "not start yet",
                        extraData: extraData
                    )
                }
            }

            if let endAt = self.endAt {
                if getCurrentBlock().timestamp > endAt {
                    return Drizzle.ClaimStatus(
                        code: Drizzle.ClaimStatusCode.ended,
                        eligibleAmount: eligibility.eligibleAmount,
                        message: "ended",
                        extraData: extraData
                    )
                }
            }

            if self.isPaused {
                return Drizzle.ClaimStatus(
                    code: Drizzle.ClaimStatusCode.paused,
                    eligibleAmount: eligibility.eligibleAmount,
                    message: "paused",
                    extraData: extraData
                )
            }

            return Drizzle.ClaimStatus(
                code: Drizzle.ClaimStatusCode.ok,
                eligibleAmount: eligibility.eligibleAmount,
                message: "",
                extraData: extraData
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

        pub fun togglePause(): Bool {
            self.isPaused = !self.isPaused
            return self.isPaused
        }

        // deposit more token into the DROP.
        // If the whitelist of a DROP is allowed to extend, we need
        // this function to make sure the claimers can have enough funds to withdraw.
        pub fun deposit(from: @FungibleToken.Vault) {
            pre {
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

        init(
            name: String,
            description: String,
            host: Address,
            image: String?,
            url: String?,
            startAt: UFix64?,
            endAt: UFix64?,
            tokenInfo: Drizzle.TokenInfo,
            eligibilityReviewer: {Drizzle.IEligibilityReviewer},
            vault: @FungibleToken.Vault,
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
            self.eligibilityReviewer = eligibilityReviewer

            self.isPaused = false
            self.claimedRecords = {}
            self.claimedAmount = 0.0

            self.dropVault <- vault
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
            eligibilityReviewer: {Drizzle.IEligibilityReviewer},
            vault: @FungibleToken.Vault
        ): UInt64 {
            pre {
                !Cloud.isPaused: "Cloud contract is paused!"
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
                eligibilityReviewer: eligibilityReviewer,
                vault: <- vault,
            )

            let dropID = drop.dropID

            emit DropCreated(
                dropID: drop.dropID,
                name: drop.name,
                host: drop.host,
                description: drop.description,
                tokenIdentifier: tokenInfo.tokenIdentifier
            )

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

    init() {
        self.DropCollectionStoragePath = /storage/drizzleDropCollectionStoragePath
        self.DropCollectionPublicPath = /public/drizzleDropCollectionPublicPath
        self.DropCollectionPrivatePath = /private/drizzleDropCollectionPrivatePath

        self.CloudAdminStoragePath = /storage/drizzleCloudAdminStoragePath
        self.CloudAdminPublicPath = /public/drizzleCloudPublicPath
        self.CloudAdminPrivatePath = /private/drizzleCloudPublicPath

        self.isPaused = false

        self.account.save(<- create Admin(), to: self.CloudAdminStoragePath)

        emit ContractInitialized()
    }
}