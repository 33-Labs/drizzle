import FungibleToken from "./core/FungibleToken.cdc"

pub contract Drizzle {

    pub event ContractInitialized()

    pub struct interface IPacket {
        pub let capacity: UInt32
        pub fun getAmountInPacket(params: {String: AnyStruct}): UFix64
    }

    pub struct Eligibility {
        pub let isEligible: Bool
        pub let isAvailable: Bool
        pub let eligibleAmount: UFix64
        pub let extraData: {String: AnyStruct}

        init(
            isEligible: Bool, 
            isAvailable: Bool,
            eligibleAmount: UFix64,
            extraData: {String: AnyStruct}) {
            self.isEligible = isEligible
            self.isAvailable = isAvailable
            self.eligibleAmount = eligibleAmount
            self.extraData = extraData
        }
    }

    pub struct interface IEligibilityReviewer {
        pub let packet: {IPacket}?

        pub fun checkEligibility(account: Address, params: {String: AnyStruct}): Eligibility
    }

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

    pub enum ClaimStatusCode: UInt8 {
        pub case ok
        pub case ineligible
        pub case unavailable
        pub case claimed
        pub case notStartYet
        pub case ended
        pub case paused
        pub case others
    }

    pub struct ClaimStatus {
        pub let code: ClaimStatusCode
        pub let eligibleAmount: UFix64
        pub let message: String
        pub let extraData: {String: AnyStruct}

        init(
            code: ClaimStatusCode,
            claimableAmount: UFix64,
            message: String,
            extraData: {String: AnyStruct}
        ) {
            self.code = code
            self.eligibleAmount = claimableAmount
            self.message = message
            self.extraData = extraData
        }
    }

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

    pub resource interface IDropPublic {
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
        pub let eligibilityReviewer: {IEligibilityReviewer}

        pub var isPaused: Bool
        // Helper field for use to access the claimed amount easily
        pub var claimedAmount: UFix64

        // For users to claim token
        pub fun claim(receiver: &{FungibleToken.Receiver}, params: {String: AnyStruct})
        pub fun getClaimStatus(account: Address): ClaimStatus
        pub fun getClaimedRecord(account: Address): ClaimRecord?
        pub fun getClaimedRecords(): {Address: ClaimRecord}
        pub fun getDropBalance(): UFix64
    }

    pub resource interface IDropCollectionPublic {
        pub fun getAllDrops(): {UInt64: &{IDropPublic}}
        pub fun borrowPublicDropRef(dropID: UInt64): &{IDropPublic}?
    }

    init() {
        emit ContractInitialized()
    }
}