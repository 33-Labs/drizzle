import Drizzle from "../contracts/Drizzle.cdc"
import Cloud from "../contracts/Cloud.cdc"

pub fun main(dropID: UInt64, host: Address, claimer: Address): Drizzle.ClaimRecord? {
    let dropCollection =
        getAccount(host)
        .getCapability(Cloud.DropCollectionPublicPath)
        .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow drop")
    
    return drop.getClaimedRecord(account: claimer)
}