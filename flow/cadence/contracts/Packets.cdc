import Drizzle from "./Drizzle.cdc"

pub contract Packets {

    pub struct IdenticalPacket: Drizzle.IPacket {
        pub let capacity: UInt32
        pub let amountPerPacket: UFix64

        init(capacity: UInt32, amountPerPacket: UFix64) {
            self.capacity = capacity
            self.amountPerPacket = amountPerPacket
        }

        pub fun getAmountInPacket(params: {String: AnyStruct}): UFix64 {
            let claimedCount = params["claimedCount"]! as! UInt32
            let availableCapacity = self.capacity - claimedCount
            assert(availableCapacity >= 0, message: "no longer available")

            return self.amountPerPacket
        }
    }

    pub struct RandomPacket: Drizzle.IPacket {
        pub let capacity: UInt32
        pub let totalAmount: UFix64

        init(capacity: UInt32, totalAmount: UFix64) {
            assert(totalAmount >= UFix64(capacity) * 0.001, message: "Packet amount is too small")

            self.capacity = capacity
            self.totalAmount = totalAmount
        }

        pub fun getAmountInPacket(params: {String: AnyStruct}): UFix64 {
            let claimedCount = params["claimedCount"]! as! UInt32
            let availableCapacity = self.capacity - claimedCount
            assert(availableCapacity >= 0, message: "no longer available")

            let claimedAmount = params["claimedAmount"]! as! UFix64
            let availableAmount = self.totalAmount - claimedAmount
            assert(availableAmount >= 0.0, message: "no longer available")

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