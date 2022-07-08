import Drizzle from "../contracts/Drizzle.cdc"
import DropN from "../contracts/DropN.cdc"

pub struct DropStats {
    pub let dropBalance: UFix64
    pub let claimed: {Address: UFix64}
    pub let tokenSymbol: String

    init(
        dropBalance: UFix64, 
        claimed: {Address: UFix64},
        tokenSymbol: String
    ) {
        self.dropBalance = dropBalance
        self.claimed = claimed
        self.tokenSymbol = tokenSymbol
    }
}

pub fun main(dropID: UInt64, host: Address): DropStats? {
    let dropCollection =
        getAccount(host)
        .getCapability(DropN.DropCollectionPublicPath)
        .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow drop")

    let claimed = drop.getClaimed()
    let dropBalance = drop.getDropVaultBalance()
    let tokenSymbol = drop.tokenInfo.symbol
    
    return DropStats(dropBalance: dropBalance, claimed: claimed, tokenSymbol: tokenSymbol)
}