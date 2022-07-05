import Drizzle from "../contracts/Drizzle.cdc"
import DropN from "../contracts/DropN.cdc"

pub fun main(address: Address, dropID: UInt64): &{Drizzle.IDropPublic} {
    let dropCollection =
        getAccount(address)
        .getCapability(DropN.DropCollectionPublicPath)
        .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let dropRef = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow publicDropRef")

    return dropRef
}