import Drizzle from "../contracts/Drizzle.cdc"
import DropN from "../contracts/DropN.cdc"

pub struct ClaimStatus {
    pub let message: String
    pub let claimable: Bool
    pub let amount: UFix64?
    pub let blockTime: UFix64?
    pub let startAt: UFix64?

    init(
        message: String, 
        claimable: Bool, 
        amount: UFix64?, 
        blockTime: UFix64?,
        startAt: UFix64?
    ) {
        self.message = message
        self.claimable = claimable
        self.amount = amount
        self.blockTime = blockTime
        self.startAt = startAt
    }
}

pub fun main(dropID: UInt64, host: Address, claimer: Address): ClaimStatus {
    let dropCollection =
        getAccount(host)
        .getCapability(DropN.DropCollectionPublicPath)
        .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow drop")

    let claimableAmount = drop.getClaimableAmount(address: claimer)

    if claimableAmount == nil {
        return ClaimStatus(
            message: "not eligible", 
            claimable: false, 
            amount: nil, 
            blockTime: nil,
            startAt: nil
        )
    }

    if !drop.isClaimable {
        return ClaimStatus(
            message: "not claimable", 
            claimable: false, 
            amount: claimableAmount!, 
            blockTime: nil,
            startAt: nil
        )
    }

    if let startAt = drop.startAt {
        if getCurrentBlock().timestamp <= startAt {
            return ClaimStatus(
                message: "not start", 
                claimable: false, 
                amount: claimableAmount!,
                blockTime: getCurrentBlock().timestamp,
                startAt: drop.startAt
            )    
        }
    }

    if let endAt = drop.endAt {
        if getCurrentBlock().timestamp >= endAt {
            return ClaimStatus(
                message: "ended", 
                claimable: false, 
                amount: claimableAmount!, 
                blockTime: getCurrentBlock().timestamp,
                startAt: drop.startAt
            )
        }
    }

    if let amount = drop.hasClaimed(address: claimer) {
        return ClaimStatus(
            message: "claimed", 
            claimable: false, 
            amount: amount, 
            blockTime: nil,
            startAt: drop.startAt
        )
    }

    return ClaimStatus(
        message: "eligible", 
        claimable: true, 
        amount: claimableAmount!, 
        blockTime: nil,
        startAt: drop.startAt
    )
}