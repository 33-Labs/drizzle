import DrizzleRecorder from "../../contracts/DrizzleRecorder.cdc"

pub fun main(account: Address): {UInt64: AnyStruct} {
    let recorder =
        getAccount(account)
        .getCapability(DrizzleRecorder.RecorderPublicPath)
        .borrow<&{DrizzleRecorder.IRecorderPublic}>()
    
    if let _recorder = recorder {
        let type = Type<DrizzleRecorder.CloudDrop>()
        return _recorder.getRecordsByType(type)
    }

    return {}
}