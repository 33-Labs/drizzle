import Drizzle from "../contracts/Drizzle.cdc"
import DropN from "../contracts/DropN.cdc"

pub fun main(dropID: UInt64, host: Address, claimer: Address): UFix64? {
    let dropCollection =
        getAccount(host)
        .getCapability(DropN.DropCollectionPublicPath)
        .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow drop")

    return drop.getClaimAmount(address: claimer)    
}