import Drizzle from "../contracts/Drizzle.cdc"
import DrizzleN from "../contracts/DrizzleN.cdc"

pub fun main(dropID: UInt64, host: Address): Bool {
    let dropCollection =
        getAccount(host)
        .getCapability(DrizzleN.DropCollectionPublicPath)
        .borrow<&DrizzleN.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow drop")
    
    return drop.isClaimable
}