import Drizzle from "../contracts/Drizzle.cdc"
import Cloud from "../contracts/Cloud.cdc"

pub fun main(account: Address): {UInt64: &{Drizzle.IDropPublic}} {
    let dropCollection =
        getAccount(account)
        .getCapability(Cloud.DropCollectionPublicPath)
        .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()

    if let collection = dropCollection {
        return collection.getAllDrops()
    }

    return {}
}