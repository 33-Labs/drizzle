pub contract DrizzleRecorder {

    pub let RecorderStoragePath: StoragePath
    pub let RecorderPublicPath: PublicPath
    pub let RecorderPrivatePath: PrivatePath

    pub event ContractInitialized()

    pub struct CloudDrop {
        pub let dropID: UInt64
        pub let host: Address
        pub let name: String
        pub let tokenSymbol: String
        pub let claimedAmount: UFix64
        pub let claimedAt: UFix64
        pub let extraData: {String: AnyStruct}

        init(
            dropID: UInt64,
            host: Address,
            name: String,
            tokenSymbol: String,
            claimedAmount: UFix64,
            claimedAt: UFix64,
            extraData: {String: AnyStruct}
        ) {
            self.dropID = dropID
            self.host = host
            self.name = name
            self.tokenSymbol = tokenSymbol
            self.claimedAmount = claimedAmount
            self.claimedAt = claimedAt
            self.extraData = extraData
        }
    }

    pub struct MistRaffle {
        pub let raffleID: UInt64
        pub let host: Address
        pub let name: String
        pub let nftType: Type
        pub let registeredAt: UFix64
        pub let rewardTokenIDs: [UInt64]
        pub var claimedAt: UFix64?
        pub let extraData: {String: AnyStruct}

        init(
            raffleID: UInt64,
            host: Address,
            name: String,
            nftType: Type,
            registeredAt: UFix64,
            extraData: {String: AnyStruct}
        ) {
            self.raffleID = raffleID
            self.host = host
            self.name = name
            self.nftType = nftType
            self.registeredAt = registeredAt
            self.rewardTokenIDs = []
            self.claimedAt = nil
            self.extraData = extraData
        }

        pub fun markAsClaimed(rewardTokenIDs: [UInt64], extraData: {String: AnyStruct}) {
            assert(self.claimedAt == nil, message: "Already marked as Claimed")
            self.rewardTokenIDs.appendAll(rewardTokenIDs)
            self.claimedAt = getCurrentBlock().timestamp
            for key in extraData.keys {
                if !self.extraData.containsKey(key) {
                    self.extraData[key] = extraData[key]
                }
            }
        }
    }

    pub resource interface IRecorderPublic {
        pub fun getRecords(): {Type: {UInt64: AnyStruct}}
        pub fun getRecordsByType(_ type: Type): {UInt64: AnyStruct}
        pub fun getRecord(type: Type, uuid: UInt64): AnyStruct?
    }

    pub resource Recorder: IRecorderPublic {
        pub let records: {Type: {UInt64: AnyStruct}}

        pub fun getRecords(): {Type: {UInt64: AnyStruct}} {
            return self.records
        }

        pub fun getRecordsByType(_ type: Type): {UInt64: AnyStruct} {
            self.initTypeRecords(type: type)
            return self.records[type]!
        }

        pub fun getRecord(type: Type, uuid: UInt64): AnyStruct? {
            self.initTypeRecords(type: type)
            return self.records[type]![uuid]
        }

        pub fun insertOrUpdateRecord(_ record: AnyStruct) {
            let type = record.getType()
            self.initTypeRecords(type: type)

            if record.isInstance(Type<CloudDrop>()) {
                let dropInfo = record as! CloudDrop
                self.records[type]!.insert(key: dropInfo.dropID, dropInfo)
            } else if record.isInstance(Type<MistRaffle>()) {
                let raffleInfo = record as! MistRaffle
                self.records[type]!.insert(key: raffleInfo.raffleID, raffleInfo)
            } else {
                panic("Invalid record type")
            }
        }

        pub fun removeRecord(_ record: AnyStruct) {
            let type = record.getType()
            self.initTypeRecords(type: type)
            if record.isInstance(Type<CloudDrop>()) {
                let dropInfo = record as! CloudDrop
                self.records[type]!.remove(key: dropInfo.dropID)
            } else if record.isInstance(Type<MistRaffle>()) {
                let raffleInfo = record as! MistRaffle
                self.records[type]!.remove(key: raffleInfo.raffleID)
            } else {
                panic("Invalid record type")
            }
        }

        access(self) fun initTypeRecords(type: Type) {
            assert(type == Type<CloudDrop>() || type == Type<MistRaffle>(), message: "Invalid Type")
            if self.records[type] == nil {
                self.records[type] = {}
            }
        }

        init() {
            self.records = {}
        }

        destroy() {
        }
    }

    pub fun createEmptyRecorder(): @Recorder {
        return <- create Recorder()
    }

    init() {
        self.RecorderStoragePath = /storage/drizzleRecorder
        self.RecorderPublicPath = /public/drizzleRecorder
        self.RecorderPrivatePath = /private/drizzleRecorder

        emit ContractInitialized()
    }
}