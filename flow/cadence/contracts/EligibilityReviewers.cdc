import FungibleToken from "./core/FungibleToken.cdc"
import Drizzle from "./Drizzle.cdc"
import Packets from "./Packets.cdc"
import FLOAT from "./float/FLOAT.cdc"

pub contract EligibilityReviewers {

    pub struct FLOATEventData {
        pub let host: Address
        pub let eventID: UInt64

        init(host: Address, eventID: UInt64) {
            self.host = host
            self.eventID = eventID
        }
    }

    pub struct FLOATGroupData {
        pub let host: Address
        pub let name: String

        init(host: Address, name: String) {
            self.host = host
            self.name = name
        }
    }

    pub struct WhitelistWithAmount: Drizzle.IEligibilityReviewer {
        pub let packet: {Drizzle.IPacket}?
        pub let whitelist: {Address: UFix64}

        init(whitelist: {Address: UFix64}) {
            self.whitelist = whitelist
            self.packet = nil
        }

        pub fun checkEligibility(account: Address, params: {String: AnyStruct}): Drizzle.Eligibility {
            let amount = self.whitelist[account]
            let isEligible = amount != nil

            return Drizzle.Eligibility(
                isEligible: isEligible, 
                isAvailable: isEligible,
                eligibleAmount: isEligible ? amount! : 0.0,
                extraData: {}
            )
        }
    }

    pub struct Whitelist: Drizzle.IEligibilityReviewer {
        pub let packet: {Drizzle.IPacket}?
        pub let whitelist: {Address: Bool}

        init(packet: {Drizzle.IPacket}?, whitelist: {Address: Bool}) {
            self.packet = packet
            self.whitelist = whitelist
        }

        pub fun checkEligibility(account: Address, params: {String: AnyStruct}): Drizzle.Eligibility {
            let claimedCount = params["claimedCount"]! as! UInt32
            let isAvailable = claimedCount < self.packet!.capacity 
            let isEligible = self.whitelist[account] == true
            
            var amount = 0.0
            if isAvailable {
                amount = self.packet!.getAmountInPacket(params: params)
            }

            return Drizzle.Eligibility(
                isEligible: isEligible, 
                isAvailable: isAvailable,
                eligibleAmount: amount,
                extraData: {}
            )
        }
    }

    pub struct FLOATGroup: Drizzle.IEligibilityReviewer {
        pub let packet: {Drizzle.IPacket}?
        pub let group: FLOATGroupData
        pub let threshold: UInt64
        pub let receivedBefore: UFix64

        init(
            packet: {Drizzle.IPacket}?,
            group: FLOATGroupData, 
            threshold: UInt64,
        ) {
            pre {
                packet != nil: "packet is required"
                threshold > 0: "threshold should greater than 0"
            }

            self.packet = packet
            self.group = group
            self.threshold = threshold
            self.receivedBefore = getCurrentBlock().timestamp
        }

        pub fun checkEligibility(account: Address, params: {String: AnyStruct}): Drizzle.Eligibility {
            let claimedCount = params["claimedCount"]! as! UInt32
            let isAvailable = claimedCount < self.packet!.capacity 
            
            var amount = 0.0
            if isAvailable {
                amount = self.packet!.getAmountInPacket(params: params)
            }

            return Drizzle.Eligibility(
                isEligible: self.isEligible(account: account), 
                isAvailable: isAvailable,
                eligibleAmount: amount,
                extraData: {}
            )
        }

        pub fun isEligible(account: Address): Bool {
            let floatEventCollection = getAccount(self.group.host)
                .getCapability(FLOAT.FLOATEventsPublicPath)
                .borrow<&FLOAT.FLOATEvents{FLOAT.FLOATEventsPublic}>()
                ?? panic("Could not borrow the FLOAT Events Collection from the account.")
            
            let group = floatEventCollection.getGroup(groupName: self.group.name) 
                ?? panic("This group doesn't exist.")
            let eventIDs = group.getEvents()

            let floatCollection = getAccount(account)
                .getCapability(FLOAT.FLOATCollectionPublicPath)
                .borrow<&FLOAT.Collection{FLOAT.CollectionPublic}>()
                ?? panic("Could not borrow the Collection from the account.")

            var validCount: UInt64 = 0
            for eventID in eventIDs {
                let ownedIDs = floatCollection.ownedIdsFromEvent(eventId: eventID)
                for ownedEventID in ownedIDs {
                    if let float = floatCollection.borrowFLOAT(id: ownedEventID) {
                        if float.dateReceived <= self.receivedBefore {
                            validCount = validCount + 1
                            if validCount >= self.threshold {
                                return true
                            }
                        }
                    }
                }
            }

            return false
        }
    }

    pub struct FLOATs: Drizzle.IEligibilityReviewer {
        pub let packet: {Drizzle.IPacket}?
        pub let events: [FLOATEventData]
        pub let threshold: UInt64
        pub let receivedBefore: UFix64

        init(
            packet: {Drizzle.IPacket}?,
            events: [FLOATEventData],
            threshold: UInt64
        ) {
            pre {
                packet != nil: "Packet is required"
                threshold > 0: "threshold should greater than 0"
                events.length > 0: "events should not be empty"
            }

            self.packet = packet
            self.events = events 
            self.threshold = threshold
            self.receivedBefore = getCurrentBlock().timestamp
        }

        pub fun checkEligibility(account: Address, params: {String: AnyStruct}): Drizzle.Eligibility {
            let claimedCount = params["claimedCount"]! as! UInt32
            let isAvailable = claimedCount < self.packet!.capacity 
            
            var amount = 0.0
            if isAvailable {
                amount = self.packet!.getAmountInPacket(params: params)
            }

            return Drizzle.Eligibility(
                isEligible: self.isEligible(account: account), 
                isAvailable: isAvailable,
                eligibleAmount: amount,
                extraData: {}
            )
        }

        pub fun isEligible(account: Address): Bool {
            let floatCollection = getAccount(account)
                .getCapability(FLOAT.FLOATCollectionPublicPath)
                .borrow<&FLOAT.Collection{FLOAT.CollectionPublic}>()
                ?? panic("Could not borrow the Collection from the account.")

            var validCount: UInt64 = 0
            for _event in self.events {
                let ownedIDs = floatCollection.ownedIdsFromEvent(eventId: _event.eventID)
                for ownedEventID in ownedIDs {
                    if let float = floatCollection.borrowFLOAT(id: ownedEventID) {
                        if float.dateReceived <= self.receivedBefore {
                            validCount = validCount + 1
                            if validCount >= self.threshold {
                                return true
                            }
                        }
                    }
                }
            }

            return false
        }
    }
}