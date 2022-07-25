import FungibleToken from "./core/FungibleToken.cdc"
import Drizzle from "./Drizzle.cdc"
import Distributors from "./Distributors.cdc"
import FLOAT from "./float/FLOAT.cdc"

// In Drizzle, EligibilityVerifiers determines an account is eligible or not
// EligibilityVerifier should conform IEligibilityVerifier in Drizzle.cdc

pub contract EligibilityVerifiers {

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

    pub struct Whitelist: Drizzle.IEligibilityVerifier {
        pub let whitelist: {Address: AnyStruct}

        init(whitelist: {Address: AnyStruct}) {
            self.whitelist = whitelist
        }

        pub fun verify(account: Address, params: {String: AnyStruct}): Drizzle.VerifyResult {
            return Drizzle.VerifyResult(
                isEligible: self.whitelist[account] != nil,
                extraData: {}
            )
        }
    }

    pub struct FLOATGroup: Drizzle.IEligibilityVerifier {
        pub let group: FLOATGroupData
        pub let threshold: UInt64
        pub let receivedBefore: UFix64

        init(
            group: FLOATGroupData, 
            threshold: UInt64,
        ) {
            pre {
                threshold > 0: "threshold should greater than 0"
            }

            self.group = group
            self.threshold = threshold
            // The FLOAT should be received before this DROP be created
            // or the users can transfer their FLOATs and claim again
            self.receivedBefore = getCurrentBlock().timestamp
        }

        pub fun verify(account: Address, params: {String: AnyStruct}): Drizzle.VerifyResult {
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

            if floatCollection == nil {
                return Drizzle.VerifyResult(isEligible: false, extraData: {})
            } 

            var validCount: UInt64 = 0
            for eventID in eventIDs {
                let ownedIDs = floatCollection!.ownedIdsFromEvent(eventId: eventID)
                for ownedEventID in ownedIDs {
                    if let float = floatCollection!.borrowFLOAT(id: ownedEventID) {
                        if float.dateReceived <= self.receivedBefore {
                            validCount = validCount + 1
                            if validCount >= self.threshold {
                                return Drizzle.VerifyResult(isEligible: true, extraData: {})
                            }
                        }
                    }
                }
            }
            return Drizzle.VerifyResult(isEligible: false, extraData: {})
        }
    }

    pub struct FLOATs: Drizzle.IEligibilityVerifier {
        pub let events: [FLOATEventData]
        pub let threshold: UInt64
        pub let receivedBefore: UFix64

        init(
            events: [FLOATEventData],
            threshold: UInt64
        ) {
            pre {
                threshold > 0: "Threshold should greater than 0"
                events.length > 0: "Events should not be empty"
            }

            self.events = events 
            self.threshold = threshold
            // The FLOAT should be received before this DROP be created
            // or the users can transfer their FLOATs and claim again
            self.receivedBefore = getCurrentBlock().timestamp
        }

        pub fun verify(account: Address, params: {String: AnyStruct}): Drizzle.VerifyResult {
            let floatCollection = getAccount(account)
                .getCapability(FLOAT.FLOATCollectionPublicPath)
                .borrow<&FLOAT.Collection{FLOAT.CollectionPublic}>()

            if floatCollection == nil {
                return Drizzle.VerifyResult(isEligible: false, extraData: {})
            }

            var validCount: UInt64 = 0
            for _event in self.events {
                let ownedIDs = floatCollection!.ownedIdsFromEvent(eventId: _event.eventID)
                for ownedEventID in ownedIDs {
                    if let float = floatCollection!.borrowFLOAT(id: ownedEventID) {
                        if float.dateReceived <= self.receivedBefore {
                            validCount = validCount + 1
                            if validCount >= self.threshold {
                                return Drizzle.VerifyResult(isEligible: true, extraData: {})
                            }
                        }
                    }
                }
            }
            return Drizzle.VerifyResult(isEligible: false, extraData: {})
        }
    }
}