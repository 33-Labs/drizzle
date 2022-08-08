import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const FungibleTokenPath = "0xFungibleToken"
const FLOATPath = "0xFLOAT"

export const getFloatEvent = async (eventHost, eventID) => {
  const code = `
  import FLOAT from 0xFLOAT

  pub fun main(account: Address, eventId: UInt64): FLOATEventMetadata {
    let floatEventCollection = getAccount(account).getCapability(FLOAT.FLOATEventsPublicPath)
                                .borrow<&FLOAT.FLOATEvents{FLOAT.FLOATEventsPublic}>()
                                ?? panic("Could not borrow the FLOAT Events Collection from the account.")
    let event = floatEventCollection.borrowPublicEventRef(eventId: eventId) ?? panic("This event does not exist in the account")
    return FLOATEventMetadata(
      _claimable: event.claimable, 
      _dateCreated: event.dateCreated, 
      _description: event.description, 
      _eventId: event.eventId, 
      _groups: event.getGroups(), 
      _host: event.host, 
      _image: event.image, 
      _name: event.name, 
      _transferrable: event.transferrable, 
      _url: event.url 
    )
  }
  
  pub struct FLOATEventMetadata {
    pub let claimable: Bool
    pub let dateCreated: UFix64
    pub let description: String 
    pub let eventId: UInt64
    pub let groups: [String]
    pub let host: Address
    pub let image: String 
    pub let name: String
    pub let transferrable: Bool
    pub let url: String
  
    init(
        _claimable: Bool,
        _dateCreated: UFix64,
        _description: String, 
        _eventId: UInt64,
        _groups: [String],
        _host: Address, 
        _image: String, 
        _name: String,
        _transferrable: Bool,
        _url: String
    ) {
        self.claimable = _claimable
        self.dateCreated = _dateCreated
        self.description = _description
        self.eventId = _eventId
        self.groups = _groups
        self.host = _host
        self.image = _image
        self.name = _name
        self.transferrable = _transferrable
        self.url = _url
    }
  }
  `
  .replace(FLOATPath, publicConfig.floatAddress)

  const event = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(eventHost, t.Address),
      arg(eventID, t.UInt64)
    ]
  }) 

  return event
}


export const getFloatEventsInGroup = async (eventHost, groupName) => {
  const code = `
  import FLOAT from 0xFLOAT

  pub fun main(account: Address, groupName: String): [FLOATEventMetadata] {
    let floatEventCollection = getAccount(account).getCapability(FLOAT.FLOATEventsPublicPath)
                                .borrow<&FLOAT.FLOATEvents{FLOAT.FLOATEventsPublic}>()
                                ?? panic("Could not borrow the FLOAT Events Collection from the account.")
    let group = floatEventCollection.getGroup(groupName: groupName) ?? panic("This group doesn't exist.")
    let eventIds = group.getEvents()
  
    let answer: [FLOATEventMetadata] = []
    for eventId in eventIds {
      let event = floatEventCollection.borrowPublicEventRef(eventId: eventId) ?? panic("This event does not exist in the account")
      let metadata = FLOATEventMetadata(
        _claimable: event.claimable, 
        _dateCreated: event.dateCreated, 
        _description: event.description, 
        _eventId: event.eventId, 
        _groups: event.getGroups(), 
        _host: event.host, 
        _image: event.image, 
        _name: event.name, 
        _transferrable: event.transferrable, 
        _url: event.url 
      )
      answer.append(metadata)
    }
  
    return answer
  }
  
  
  pub struct FLOATEventMetadata {
    pub let claimable: Bool
    pub let dateCreated: UFix64
    pub let description: String 
    pub let eventId: UInt64
    pub let groups: [String]
    pub let host: Address
    pub let image: String 
    pub let name: String
    pub let transferrable: Bool
    pub let url: String
  
    init(
        _claimable: Bool,
        _dateCreated: UFix64,
        _description: String, 
        _eventId: UInt64,
        _groups: [String],
        _host: Address, 
        _image: String, 
        _name: String,
        _transferrable: Bool,
        _url: String
    ) {
        self.claimable = _claimable
        self.dateCreated = _dateCreated
        self.description = _description
        self.eventId = _eventId
        self.groups = _groups
        self.host = _host
        self.image = _image
        self.name = _name
        self.transferrable = _transferrable
        self.url = _url
    }
  }
  `
  .replace(FLOATPath, publicConfig.floatAddress)

  const events = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(eventHost, t.Address),
      arg(groupName, t.String)
    ]
  }) 

  return events
}


