import Drizzle from "./Drizzle.cdc"
import FungibleToken from "./FungibleToken.cdc"

pub contract DrizzleN {

    pub let DropCollectionStoragePath: StoragePath
    pub let DropCollectionPublicPath: PublicPath
    pub let DropCollectionPrivatePath: PrivatePath

    pub event ContractInitialized()

    pub event DropClaimed(dropID: UInt64, name: String, host: Address, image: String, claimer: Address, amount: UFix64)
    pub event DropCreated(dropID: UInt64, name: String, host: Address, image: String, description: String)
    pub event DropDestroyed(dropID: UInt64, name: String, host: Address)

    pub resource Drop: Drizzle.IDropPublic {
        pub let name: String
        pub let description: String
        pub let host: Address
        pub let createdAt: UFix64
        pub let dropID: UInt64
        pub let image: String
        pub let tokenInfo: Drizzle.TokenInfo

        pub var isClaimable: Bool

        pub var claimed: {Address: UFix64}
        pub let claims: {Address: UFix64}
        pub let dropVault: @FungibleToken.Vault

        pub fun claim(receiver: &{FungibleToken.Receiver}, params: {String: AnyStruct}) {
            pre {
                self.isClaimable: "not claimable"
                self.claimed[receiver.owner!.address] == nil: "claimed"
                !(self.claims[receiver.owner!.address] == nil): "not eligible"
            }

            let claimer = receiver.owner!.address
            let amount = self.claims[claimer]!

            self.claimed.insert(key: claimer, amount)
            let v <- self.dropVault.withdraw(amount: amount)
            receiver.deposit(from: <- v)

            emit DropClaimed(
                dropID: self.dropID,
                name: self.name,
                host: self.host,
                image: self.image,
                claimer: claimer,
                amount: amount
            )
        }
        
        pub fun getClaimAmount(address: Address): UFix64? {
            return self.claims[address]
        }

        pub fun hasClaimed(address: Address): UFix64? {
            return self.claimed[address]
        }

        pub fun getClaimed(): {Address: UFix64} {
            return self.claimed
        }

        pub fun getDropVaultBalance(): UFix64 {
            return self.dropVault.balance
        }

        // ---- private methods ----

        pub fun toggleClaimable(): Bool {
            self.isClaimable = !self.isClaimable
            return self.isClaimable
        }

        // NOTE: it the address has already in the claims, the old value will be replaced
        // NOTE2: deposit should be called to make sure dropVault have enough fund for claiming
        pub fun addClaims(_ claims: {Address: UFix64}) {
            for address in claims.keys {
                self.claims.insert(key: address, claims[address]!)
            }
        }

        pub fun deposit(from: @FungibleToken.Vault) {
            pre {
                from.balance > 0.0: "deposit empty vault"
            }

            self.dropVault.deposit(from: <- from)
        }

        pub fun withdrawAll(receiver: &{FungibleToken.Receiver}) {
            if self.dropVault.balance > 0.0 {
                let v <- self.dropVault.withdraw(amount: self.dropVault.balance)
                receiver.deposit(from: <- v)
            }
        }

        init(
            name: String,
            description: String,
            host: Address,
            image: String,
            tokenInfo: Drizzle.TokenInfo,
            vault: @FungibleToken.Vault,
            claims: {Address: UFix64},
        ) {
            let tokenVaultType = CompositeType(tokenInfo.providerIdentifier)!
            if !vault.isInstance(tokenVaultType) {
                panic("invalid token info: get ".concat(vault.getType().identifier)
                .concat(", want ").concat(tokenVaultType.identifier))
            }

            self.name = name
            self.description = description
            self.host = host
            self.createdAt = getCurrentBlock().timestamp
            self.dropID = self.uuid
            self.image = image
            self.dropVault <- vault
            self.claims = claims
            self.tokenInfo = tokenInfo

            self.isClaimable = true
            self.claimed = {}
        }

        destroy() {
            pre {
                self.dropVault.balance == 0.0: "dropVault is not empty"
            }

            destroy self.dropVault
            emit DropDestroyed(dropID: self.dropID, name: self.name, host: self.host)
        }
    }

    pub resource DropCollection: Drizzle.IDropCollectionPublic {
        pub var drops: @{UInt64: Drop}

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
            drop.withdrawAll(receiver: receiver)
            destroy drop
        }

        pub fun createDrop(
            name: String,
            description: String,
            host: Address,
            image: String,
            tokenInfo: Drizzle.TokenInfo,
            vault: @FungibleToken.Vault,
            claims: {Address: UFix64},
        ): UInt64 {
            let drop <- create Drop(
                name: name, 
                description: description, 
                host: host,
                image: image,
                tokenInfo: tokenInfo,
                vault: <- vault,
                claims: claims
            )

            let dropID = drop.dropID
            emit DropCreated(
                dropID: dropID,
                name: drop.name,
                host: drop.host,
                image: drop.image,
                description: drop.description,
            )

            self.drops[dropID] <-! drop

            return dropID
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

    init() {
        self.DropCollectionStoragePath = /storage/drizzleNDropCollectionStoragePath
        self.DropCollectionPublicPath = /public/drizzleNDropCollectionPublicPath
        self.DropCollectionPrivatePath = /private/drizzleNDropCollectionPrivatePath

        emit ContractInitialized()
    }
}