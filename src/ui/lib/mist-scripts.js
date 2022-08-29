import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import { generateImportsAndInterfaces } from "./utils"

const MistPath = "0xMist"

export const getNFTDisplays = async (account, nft) => {
  const [imports, interfaces] = generateImportsAndInterfaces(nft.collectionType.restrictions)
  let rawCode = `
  pub struct NFTDisplay {
    pub let tokenID: UInt64
    pub let name: String
    pub let description: String
    pub let thumbnail: String
    pub let extraData: {String: AnyStruct}

    init(tokenID: UInt64, name: String, description: String, thumbnail: String, extraData: {String: AnyStruct}) {
      self.tokenID = tokenID
      self.name = name
      self.description = description
      self.thumbnail = thumbnail
      self.extraData = extraData
    }
  }

  pub fun main(account: Address): {UInt64: NFTDisplay} {
      let NFTs: {UInt64: NFTDisplay} = {}
      let owner = getAuthAccount(account)
      let tempPathStr = "drizzleTempPath"
      let tempPublicPath = PublicPath(identifier: tempPathStr)!
      owner.link<&{MetadataViews.ResolverCollection}>(
              tempPublicPath,
              target: ${nft.collectionStoragePath}
      )

      if let collection = owner.getCapability<&{MetadataViews.ResolverCollection}>(tempPublicPath).borrow() {
          for tokenID in collection.getIDs() {
              let resolver = collection.borrowViewResolver(id: tokenID)
              if let display = MetadataViews.getDisplay(resolver) {
                  var name = display.name
                  if name.length == 0 {
                    name = "${nft.contractName} #".concat(tokenID.toString())
                  }
                  NFTs[tokenID] = NFTDisplay(
                    tokenID: tokenID,
                    name: name,
                    description: display.description,
                    thumbnail: display.thumbnail.uri(),
                    extraData: {}
                  )
              }
          }
      }

      return NFTs
  }
  `

  if (nft.contractName == "FlovatarComponent" || nft.contractName == "TopShot" || nft.contractName == "Flovatar") {
    rawCode = `
    pub struct NFTDisplay {
      pub let tokenID: UInt64
      pub let name: String
      pub let description: String
      pub let thumbnail: String
      pub let extraData: {String: AnyStruct}
  
      init(tokenID: UInt64, name: String, description: String, thumbnail: String, extraData: {String: AnyStruct}) {
        self.tokenID = tokenID
        self.name = name
        self.description = description
        self.thumbnail = thumbnail
        self.extraData = extraData
      }
    }
  
    pub fun main(account: Address): {UInt64: NFTDisplay} {
        let NFTs: {UInt64: NFTDisplay} = {}
        let owner = getAuthAccount(account)
        let tempPathStr = "drizzleTempPath"
        let tempPublicPath = PublicPath(identifier: tempPathStr)!
        owner.link<&{MetadataViews.ResolverCollection}>(
                tempPublicPath,
                target: ${nft.collectionStoragePath}
        )
  
        if let collection = owner.getCapability<&{MetadataViews.ResolverCollection}>(tempPublicPath).borrow() {
            for tokenID in collection.getIDs() {
                let resolver = collection.borrowViewResolver(id: tokenID)
                let extraData: {String: AnyStruct} = {}
                if let rarity = MetadataViews.getRarity(resolver) {
                  if let description = rarity.description {
                    extraData["rarityDesc"] = rarity.description
                  }
                }

                if let display = MetadataViews.getDisplay(resolver) {
                    var name = display.name
                    if name.length == 0 {
                      name = "${nft.contractName} #".concat(tokenID.toString())
                    }
                    NFTs[tokenID] = NFTDisplay(
                      tokenID: tokenID,
                      name: name,
                      description: display.description,
                      thumbnail: display.thumbnail.uri(),
                      extraData: extraData
                    )
                }
            }
        }
  
        return NFTs
    }
    `
  }

  if (nft.contractName == "FLOAT") {
    rawCode = `
    pub struct NFTDisplay {
      pub let tokenID: UInt64
      pub let name: String
      pub let description: String
      pub let thumbnail: String
      pub let extraData: {String: AnyStruct}
  
      init(tokenID: UInt64, name: String, description: String, thumbnail: String, extraData: {String: AnyStruct}) {
        self.tokenID = tokenID
        self.name = name
        self.description = description
        self.thumbnail = thumbnail
        self.extraData = extraData
      }
    }
  
    pub fun main(account: Address): {UInt64: NFTDisplay} {
        let NFTs: {UInt64: NFTDisplay} = {}
  
        if let collection = getAccount(account).getCapability(${nft.collectionPublicPath}).borrow<&{${interfaces}}>() {
          for tokenID in collection.getIDs() {
            if collection.borrowFLOAT(id: tokenID)!.getEventMetadata()?.transferrable == true {
                let resolver = collection.borrowViewResolver(id: tokenID)
                if let display = MetadataViews.getDisplay(resolver) {
                    NFTs[tokenID] = NFTDisplay(
                        tokenID: tokenID,
                        name: display.name,
                        description: display.description,
                        thumbnail: display.thumbnail.uri(),
                        extraData: {}
                    )
                }
            }
          }
        }
        return NFTs
    }
    `
  }

  const code = imports.concat(rawCode)

  const event = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address)
    ]
  }) 

  return event
}

export const queryClaimStatus = async (
  raffleID,
  host,
  claimer
) => {
  const code = `
  import Mist from 0xMist

  pub struct ClaimStatus {
      pub let availability: Mist.Availability
      pub let eligibilityForRegistration: Mist.Eligibility
      pub let eligibilityForClaim: Mist.Eligibility
  
      init(
          availability: Mist.Availability,
          eligibilityForRegistration: Mist.Eligibility,
          eligibilityForClaim: Mist.Eligibility
      ) {
          self.availability = availability
          self.eligibilityForRegistration = eligibilityForRegistration
          self.eligibilityForClaim = eligibilityForClaim
      }
  }
  
  pub fun main(raffleID: UInt64, host: Address, claimer: Address): ClaimStatus {
      let raffleCollection =
          getAccount(host)
          .getCapability(Mist.RaffleCollectionPublicPath)
          .borrow<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>()
          ?? panic("Could not borrow IRaffleCollectionPublic from address")
  
      let raffle = raffleCollection.borrowPublicRaffleRef(raffleID: raffleID)
          ?? panic("Could not borrow raffle")
  
      let availability = raffle.checkAvailability(params: {})
      let eligibilityR = raffle.checkRegistrationEligibility(account: claimer, params: {})
      let eligibilityC = raffle.checkClaimEligibility(account: claimer, params: {})
  
      return ClaimStatus(
          availability: availability,
          eligibilityForRegistration: eligibilityR,
          eligibilityForClaim: eligibilityC
      )
  }
  `
  .replace(MistPath, publicConfig.mistAddress)

  const status = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(raffleID, t.UInt64),
      arg(host, t.Address),
      arg(claimer, t.Address),
    ]
  }) 

  return status
}

export const queryRaffle = async (raffleID, host) => {
  const code = `
  import Mist from 0xMist

  pub fun main(raffleID: UInt64, host: Address): &{Mist.IRafflePublic} {
      let raffleCollection =
          getAccount(host)
          .getCapability(Mist.RaffleCollectionPublicPath)
          .borrow<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>()
          ?? panic("Could not borrow IRaffleCollectionPublic from address")
  
      let raffleRef = raffleCollection.borrowPublicRaffleRef(raffleID: raffleID)
          ?? panic("Could not borrow raffle")
  
      return raffleRef
  }
  `
  .replace(MistPath, publicConfig.mistAddress)

  const raffle = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(raffleID, t.UInt64),
      arg(host, t.Address)
    ]
  }) 

  return raffle
}

export const queryRaffles = async (address) => {
  const code = `
  import Mist from 0xMist

  pub fun main(account: Address): {UInt64: &{Mist.IRafflePublic}} {
      let raffleCollection =
          getAccount(account)
          .getCapability(Mist.RaffleCollectionPublicPath)
          .borrow<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>()
  
      if let collection = raffleCollection {
          return collection.getAllRaffles()
      }
  
      return {}
  }
  `
  .replace(MistPath, publicConfig.mistAddress)

  const raffles = await fcl.query({
    cadence: code,
    args: (arg, t) => [arg(address, t.Address)]
  }) 

  return raffles ?? []
}