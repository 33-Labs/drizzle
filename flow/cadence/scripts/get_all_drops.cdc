import Drizzle from "../contracts/Drizzle.cdc"
import DropN from "../contracts/DropN.cdc"

pub fun main(address: Address): {UInt64: &{Drizzle.IDropPublic}} {
    let dropCollection =
        getAccount(address)
        .getCapability(DropN.DropCollectionPublicPath)
        .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()

    if let collection = dropCollection {
        return collection.getAllDrops()
    }

    return {}
}