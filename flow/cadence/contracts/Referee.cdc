// Draft

pub contract Referee {

    pub resource Group {
        pub let members: [Address]

        pub fun isMember(address: Address): Bool {
            return self.members.contains(address)
        }
    }

    pub struct interface IEligible {
        pub fun isEligible(address: Address): Bool
        pub fun claimableAmount(address: Address): UFix64?
        pub fun claimedAmount(address: Address): UFix64?

        pub fun getClaimed(): {Address: UFix64}
    }

    pub struct RecipientsNAmounts {
        pub let claims: {Address: UFix64}
        pub let claimed: {Address: UFix64}

        pub fun isEligible(address: Address): Bool {
            return self.claims[address] != nil
        }

        pub fun claimableAmount(address: Address): UFix64? {
            return self.claims[address]
        }

        pub fun hasClaimed(address: Address): UFix64? {
            return self.claimed[address]
        }

        pub fun getClaimed(): {Address: UFix64} {
            return self.claimed
        }

        // internal methods

        pub fun addClaims(_ claims: {Address: UFix64}) {
            for address in claims.keys {
                self.claims.insert(key: address, claims[address]!)
            }
        }

        init(claims: {Address: UFix64}) {
            self.claims = claims
            self.claimed = {}
        }
    }

    pub struct IdenticalAmountForGroup {
        pub let group: &Group
        pub let dropAmount: UFix64
        pub let totalDropCount: UInt64

        pub let claimedDropCount: UInt64
        pub let claimed: {Address: UFix64}

        pub fun isEligible(address: Address): Bool {
            return self.group.isMember(address: address)
        }

        pub fun claimableAmount(address: Address): UFix64? {
            if (isEligible(address: address)) {
                return dropAmount
            }
            return nil
        }

        pub fun hasClaimed(address: Address): UFix64? {
            return self.claimed[address]
        }

        pub fun getClaimed(): {Address: UFix64} {
            return self.claimed
        }

        init(group: &Group, dropAmount: UFix64, totalDropCount: UInt64) {
            self.group = group
            self.dropAmount = dropAmount
            self.totalDropCount = totalDropCount

            self.claimedDropCount = 0
            self.claimed = {}
        }
    }

    pub struct RandomAmountForGroup {
        pub let group: &Group
        pub let totalAmount: UFix64
        pub let totalDropCount: UInt64
        pub let claimedDropCount: UInt64

        pub let drops: [UFix64]
        pub let claimed: {Address: UFix64}

        pub fun isEligible(address: Address): Bool {
            return self.group.isMember(address: address)
        }

        pub fun claimableAmount(address: Address): UFix64? {
            return self.drops[self.claimedDropCount]
        }

        pub fun hasClaimed(address: Address): UFix64? {
            return self.claimed[address]
        }

        pub fun getClaimed(): {Address: UFix64} {
            return self.claimed
        }

        init(group: &Group, totalAmount: UFix64, totalDropCount: UInt64) {
            self.gropu = group
            self.totalAmount = totalAmount
            self.totalDropCount = totalDropCount

            self.claimedDropCount = 0
            
            var counter: UInt64 = 0
            var sum: UFix64 = 0.0
            var drops = []
            while (counter < totalDropCount - 1) {
                let amount = UFix64(unsafeRandom() / 100000000) / UFix64(UInt64.max / 100000000) * totalAmount
                drops.append(amount)
                sum = sum + amount
                counter = counter + 1
            }

            drops.append(totalAmount - sum)

            self.drops = drops
            self.claimed = {}
        }
    }
}