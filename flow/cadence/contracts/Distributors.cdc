import Drizzle from "./Drizzle.cdc"

// In Drizzle, we use Packet to define the fund dispatcher
// A Packet should conform IDistributor in Drizzle.cdc
pub contract Distributors {

    pub struct Exclusive: Drizzle.IDistributor {
        pub let capacity: UInt32
        pub let distributeList: {Address: UFix64}

        init(distributeList: {Address: UFix64}) {
            pre {
                distributeList.keys.length > 0: "empty distributeList"
            }
            self.capacity = UInt32.max
            self.distributeList = distributeList
        }

        pub fun isAvailable(params: {String: AnyStruct}): Bool {
            let claimedCount = params["claimedCount"]! as! UInt32
            let availableCapacity = self.capacity - claimedCount 
            return availableCapacity >= 0
        }

        pub fun getEligibleAmount(params: {String: AnyStruct}): UFix64 {
            if !self.isAvailable(params: params) {
                return 0.0
            }

            let claimer = params["claimer"]! as! Address
            return self.distributeList[claimer] ?? 0.0
        }
    }

    pub struct Identical: Drizzle.IDistributor {
        pub let capacity: UInt32
        pub let amountPerEntry: UFix64

        init(capacity: UInt32, amountPerEntry: UFix64) {
            pre {
                amountPerEntry > 0.0: "invalid amount"
            }
            self.capacity = capacity
            self.amountPerEntry = amountPerEntry
        }

        pub fun isAvailable(params: {String: AnyStruct}): Bool {
            let claimedCount = params["claimedCount"]! as! UInt32
            let availableCapacity = self.capacity - claimedCount 
            return availableCapacity > 0
        }

        pub fun getEligibleAmount(params: {String: AnyStruct}): UFix64 {
            assert(self.isAvailable(params: params), message: "no longer available")
            return self.amountPerEntry
        }
    }

    // To simplify user interaction, the implementation of this mode is a bit naive, 
    // someone might get a higher reward by using "Try & Abort", so please use it just for fun.
    pub struct Random: Drizzle.IDistributor {
        pub let capacity: UInt32
        pub let totalAmount: UFix64

        init(capacity: UInt32, totalAmount: UFix64) {
            assert(totalAmount >= UFix64(capacity) * 0.001, message: "amount is too small")

            self.capacity = capacity
            self.totalAmount = totalAmount
        }

        pub fun isAvailable(params: {String: AnyStruct}): Bool {
            let claimedCount = params["claimedCount"]! as! UInt32
            let availableCapacity = self.capacity - claimedCount 
            if availableCapacity <= 0 {
                return false
            }

            let claimedAmount = params["claimedAmount"]! as! UFix64
            let availableAmount = self.totalAmount - claimedAmount
            if availableAmount <= 0.0 {
                return false
            }

            return true
        }

        pub fun getEligibleAmount(params: {String: AnyStruct}): UFix64 {
            let claimedCount = params["claimedCount"]! as! UInt32
            let availableCapacity = self.capacity - claimedCount 
            assert(availableCapacity > 0, message: "no longer available")


            let claimedAmount = params["claimedAmount"]! as! UFix64
            let availableAmount = self.totalAmount - claimedAmount
            assert(availableAmount > 0.0, message: "no longer available")

            if availableCapacity == 1 {
                return availableAmount
            }

            let minAmount = 0.00000001
            let upperAmount = 2.0 * (availableAmount / UFix64(availableCapacity)) - minAmount
            let amount = UFix64(unsafeRandom() / 100000000) / UFix64(UInt64.max / 100000000) * upperAmount

            // make sure no account will claim a 0 packet
            return amount < minAmount ? minAmount : amount
        }
    }
}