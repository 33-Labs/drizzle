import Cloud from "../../contracts/Cloud.cdc"
import EligibilityVerifiers from "../../contracts/EligibilityVerifiers.cdc"

pub fun main(dropID: UInt64, host: Address):  {String: [{EligibilityVerifiers.IEligibilityVerifier}]}{
    let dropCollection =
        getAccount(host)
        .getCapability(Cloud.DropCollectionPublicPath)
        .borrow<&Cloud.DropCollection{Cloud.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow drop")
    
    return drop.getVerifiers()
}