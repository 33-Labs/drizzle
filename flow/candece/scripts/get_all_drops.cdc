import Drizzle from "../contracts/Drizzle.cdc"
import DrizzleN from "../contracts/DrizzleN.cdc"

pub fun main(address: Address): {UInt64: &{Drizzle.IDropPublic}} {
    let dropCollection =
        getAccount(address)
        .getCapability(DrizzleN.DropCollectionPublicPath)
        .borrow<&DrizzleN.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    return dropCollection.getAllDrops()
}