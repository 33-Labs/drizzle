pub contract Fog {

    pub enum RaffleStatus: UInt64 {
        pub let notStartYet
        pub let registering
        pub let drawing
        pub let drawn
    }

    pub struct interface IRafflePublic {
        pub let registerEndAt: UFix64
        pub let numberOfwinners: UInt8

        pub fun register(account: Address)
        pub fun hasRegistered(account: Address): Bool
        pub fun getRegisteredRecords(): {Address: {String: AnyStruct}}
        pub fun getWinners(): {Address: {String: AnyStruct}}
        pub fun getStatus(): RaffleStatus
    }

    pub struct Raffle: IRafflePublic {
        pub let registerEndAt: UFix64
        pub let numberOfwinners: UInt8

        pub let registeredRecords: {Address: {String: AnyStruct}}
        pub let winners: {Address: {String: AnyStruct}}
        pub let candidates: [Address]

        pub fun register(account: Address) {
            pre {
                !self.hasRegistered(account: account): "has registered"
                getCurrentBlock().timestamp <= registerEndAt: "be late for registery"
            }
            self.registeredRecords[account] = {}
            self.candidates.append(account)
        }

        pub fun hasRegistered(account: Address): Bool {
            return self.registeredRecords[account] != nil
        }

        pub fun getRegisteredRecords(): {Address: RegisterRecord} {
            return self.registeredRecords
        }

        pub fun getWinners(): {Address: {String: AnyStruct}} {
            return self.winners
        }

        pub fun getStatus(): RaffleStatus {
            if getCurrentBlock().timestamp < self.registerEndAt {
                return RaffleStatus.registering
            }

            let drawn = self.numberOfWinners == self.winners.keys.length
            if drawn {
                return RaffleStatus.drawn
            } 

            return RaffleStatus.drawing
        }

        pub fun draw() {
            pre {
                getCurrentBlock().timestamp > self.registerEndAt: "open for registration"
                self.candidates.length > 0: "no candidates"
                self.winners.keys.length < self.numberOfWinners: "no capacity"
            }

            let winnerIndex = unsafeRandom() % self.candidates.length
            winner = self.candidates[winnerIndex]
            self.winners[winner] = {}
            self.candidates.remove(at: winnerIndex)
        }

        pub fun batchDraw() {
            pre {
                getCurrentBlock().timestamp > self.registerEndAt: "open for registration"
                self.candidates.length > 0: "no candidates"
                self.winners.keys.length < self.numberOfWinners: "no capacity"
            }

            let availableCapacity = self.numberOfWinners - self.winners.keys.length
            assert(self.candidates.length >= availableCapacity, message: "no enough candidates")

            while self.winners.keys.length < numberOfwinners {
                let winnerIndex = unsafeRandom() % self.candidates.length
                winner = self.candidates[winnerIndex]
                self.winners[winner] = {}
                self.candidates.remove(at: winnerIndex)
            }
        }
    }
}