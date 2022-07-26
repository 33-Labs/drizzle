// Made by Lanford33

// We aim to create a tool for users to create airdrop easily. Drizzle is the name of this tool, and we call
// a airdrop created by using Drizzle as DROP.

// Drizzle.cdc defines the interfaces and some enumerations/structs used in this tool.

import FungibleToken from "./core/FungibleToken.cdc"

pub contract Drizzle {

    pub event ContractInitialized()

    // In Drizzle, we use Packet to define the fund dispatcher
    // A Packet should conform IDistributor
    pub struct interface IDistributor {
        // capacity defines the available quota in a DROP
        pub let capacity: UInt32
        pub let type: String

        pub fun isAvailable(params: {String: AnyStruct}): Bool
        // getEligibleAmount defines how much reward can a claimer get in this DROP
        pub fun getEligibleAmount(params: {String: AnyStruct}): UFix64
    }

    pub enum EligibilityStatus: UInt8 {
        pub case eligible
        pub case notEligible
        pub case hasClaimed
    }

    // Eligibility is a struct used to describe the eligibility of an account
    pub struct Eligibility {
        pub let status: EligibilityStatus
        pub let eligibleAmount: UFix64
        pub let extraData: {String: AnyStruct}

        init(
            status: EligibilityStatus, 
            eligibleAmount: UFix64,
            extraData: {String: AnyStruct}) {
            self.status = status
            self.eligibleAmount = eligibleAmount
            self.extraData = extraData
        }
    }

    pub enum EligibilityVerifyMode: UInt8 {
        pub case oneOf
        pub case all
    }

    pub struct VerifyResult {
        pub let isEligible: Bool
        pub let extraData: {String: AnyStruct}

        init(isEligible: Bool, extraData: {String: AnyStruct}) {
            self.isEligible = isEligible
            self.extraData = extraData
        }
    }

    // // In Drizzle, EligibilityReviewer determines an account is eligible or not
    // // EligibilityReviewer should conform IEligibilityReviewer
    pub struct interface IEligibilityVerifier {
        pub let type: String

        pub fun verify(account: Address, params: {String: AnyStruct}): VerifyResult
    }

    // TokenInfo stores the information of the FungibleToken of a DROP
    pub struct TokenInfo {
        pub let tokenIdentifier: String
        pub let providerIdentifier: String
        pub let balanceIdentifier: String
        pub let receiverIdentifier: String
        pub let account: Address
        pub let contractName: String
        pub let symbol: String
        pub let providerPath: StoragePath
        pub let balancePath: PublicPath
        pub let receiverPath: PublicPath

        init(
            account: Address, 
            contractName: String,
            symbol: String,
            providerPath: String,
            balancePath: String,
            receiverPath: String 
        ) {
            let address = account.toString()
            let addrTrimmed = address.slice(from: 2, upTo: address.length)

            self.tokenIdentifier = "A.".concat(addrTrimmed).concat(".").concat(contractName)
            self.providerIdentifier = self.tokenIdentifier.concat(".Vault")
            self.balanceIdentifier = self.tokenIdentifier.concat(".Balance")
            self.receiverIdentifier = self.tokenIdentifier.concat(".Receiver")
            self.account = account
            self.contractName = contractName
            self.symbol = symbol
            self.providerPath = StoragePath(identifier: providerPath)!
            self.balancePath = PublicPath(identifier: balancePath)!
            self.receiverPath = PublicPath(identifier: receiverPath)!
        }
    }

    // We will add a ClaimRecord to claimedRecords after an account claiming it's reward
    pub struct ClaimRecord {
        pub let address: Address
        pub let amount: UFix64
        pub let claimedAt: UFix64
        pub let extraData: {String: AnyStruct}

        init(address: Address, amount: UFix64, extraData: {String: AnyStruct}) {
            self.address = address
            self.amount = amount
            self.extraData = extraData
            self.claimedAt = getCurrentBlock().timestamp
        }
    }

    pub enum AvailabilityStatus: UInt8 {
        pub case ok
        pub case ended
        pub case notStartYet
        pub case expired
        pub case noCapacity
        pub case paused
    }

    pub struct Availability {
        pub let status: AvailabilityStatus
        pub let extraData: {String: AnyStruct}

        init(status: AvailabilityStatus, extraData: {String: AnyStruct}) {
            self.status = status
            self.extraData = extraData
        }
    }

    // The airdrop created in Drizzle is called DROP.
    // IDropPublic defined the public fields and functions of a DROP
    pub resource interface IDropPublic {
        // unique ID of this DROP.
        pub let dropID: UInt64
        pub let name: String
        pub let description: String
        pub let host: Address
        pub let createdAt: UFix64
        pub let image: String?
        pub let url: String?

        pub let startAt: UFix64?
        pub let endAt: UFix64?

        pub let tokenInfo: TokenInfo
        pub let distributor: {IDistributor}
        // pub let verifiers: [{IEligibilityVerifier}]
        pub let verifyMode: EligibilityVerifyMode

        pub var isPaused: Bool
        pub var isEnded: Bool
        // Helper field for use to access the claimed amount of DROP easily
        pub var claimedAmount: UFix64

        pub fun claim(receiver: &{FungibleToken.Receiver}, params: {String: AnyStruct})
        pub fun checkAvailability(params: {String: AnyStruct}): Availability
        pub fun checkEligibility(account: Address, params: {String: AnyStruct}): Eligibility

        pub fun getClaimedRecord(account: Address): ClaimRecord?
        pub fun getClaimedRecords(): {Address: ClaimRecord}
        pub fun getDropBalance(): UFix64
        pub fun getVerifiers(): {String: [{IEligibilityVerifier}]}
    }

    pub resource interface IDropCollectionPublic {
        pub fun getAllDrops(): {UInt64: &{IDropPublic}}
        pub fun borrowPublicDropRef(dropID: UInt64): &{IDropPublic}?
    }

    init() {
        emit ContractInitialized()
    }
}