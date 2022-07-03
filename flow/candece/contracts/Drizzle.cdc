import FungibleToken from "./FungibleToken.cdc"

pub contract Drizzle {

    pub event ContractInitialized()

    pub struct TokenInfo {
        pub let tokenIdentifier: String
        pub let providerIdentifier: String
        pub let balanceIdentifier: String
        pub let receiverIdentifier: String
        pub let account: Address
        pub let contractName: String
        pub let providerPath: StoragePath
        pub let balancePath: PublicPath
        pub let receiverPath: PublicPath

        init(
            account: Address, 
            contractName: String,
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
            self.providerPath = StoragePath(identifier: providerPath)!
            self.balancePath = PublicPath(identifier: balancePath)!
            self.receiverPath = PublicPath(identifier: receiverPath)!
        }
    }

    pub resource interface IDropPublic {
        pub let name: String
        pub let description: String
        pub let host: Address
        pub let createdAt: UFix64
        pub let dropID: UInt64
        pub let image: String
        pub let tokenInfo: TokenInfo
        pub let startAt: UFix64?
        pub let endAt: UFix64?

        pub var isClaimable: Bool

        // For users to claim token
        pub fun claim(receiver: &{FungibleToken.Receiver}, params: {String: AnyStruct})
        pub fun getClaimAmount(address: Address): UFix64?
        pub fun hasClaimed(address: Address): UFix64?
        pub fun getClaimed(): {Address: UFix64}
        pub fun getDropVaultBalance(): UFix64
    }

    pub resource interface IDropCollectionPublic {
        pub fun getAllDrops(): {UInt64: &{IDropPublic}}
        pub fun borrowPublicDropRef(dropID: UInt64): &{IDropPublic}?
    }

    init() {
        emit ContractInitialized()
    }
}