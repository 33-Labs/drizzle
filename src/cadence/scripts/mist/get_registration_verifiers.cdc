import Mist from "../../contracts/Mist.cdc"
import EligibilityVerifiers from "../../contracts/EligibilityVerifiers.cdc"

pub fun main(raffleID: UInt64, host: Address):  {String: [{EligibilityVerifiers.IEligibilityVerifier}]}{
    let raffleCollection =
        getAccount(host)
        .getCapability(Mist.RaffleCollectionPublicPath)
        .borrow<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>()
        ?? panic("Could not borrow IRaffleCollectionPublic from address")

    let raffle = raffleCollection.borrowPublicRaffleRef(raffleID: raffleID)
        ?? panic("Could not borrow raffle")
    
    return raffle.getRegistrationVerifiers()
}