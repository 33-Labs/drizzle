import Drizzle from "../contracts/Drizzle.cdc"
import Cloud from "../contracts/Cloud.cdc"

pub struct ClaimStatus {
    pub let availability: Drizzle.Availability
    pub let eligibility: Drizzle.Eligibility

    init(
        availability: Drizzle.Availability,
        eligibility: Drizzle.Eligibility
    ) {
        self.availability = availability
        self.eligibility = eligibility
    }
}

pub fun main(dropID: UInt64, host: Address, claimer: Address): ClaimStatus {
    let dropCollection =
        getAccount(host)
        .getCapability(Cloud.DropCollectionPublicPath)
        .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow drop")

    let availability = drop.checkAvailability(params: {})
    let eligibility = drop.checkEligibility(account: claimer, params: {})

    return ClaimStatus(
        availability: availability,
        eligibility: eligibility
    )
}
 