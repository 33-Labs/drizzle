import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import { generateImportsAndInterfaces } from "./utils"

const NonFungibleTokenPath = "0xNonFungibleToken"
const MetadataViewsPath = "0xMetadataViews"

export const getNFTDisplays = async (account, nft) => {
  const [imports, interfaces] = generateImportsAndInterfaces(nft.collectionType.restrictions)
  let rawCode = `
  pub struct NFTDisplay {
    pub let tokenID: UInt64
    pub let name: String
    pub let description: String
    pub let thumbnail: String

    init(tokenID: UInt64, name: String, description: String, thumbnail: String) {
      self.tokenID = tokenID
      self.name = name
      self.description = description
      self.thumbnail = thumbnail
    }
  }

  pub fun main(account: Address): {UInt64: NFTDisplay} {
      let NFTs: {UInt64: NFTDisplay} = {}

      if let collection = getAccount(account).getCapability(${nft.collectionPublicPath}).borrow<&{${interfaces}}>() {
          for tokenID in collection.getIDs() {
              let resolver = collection.borrowViewResolver(id: tokenID)
              if let display = MetadataViews.getDisplay(resolver) {
                  NFTs[tokenID] = NFTDisplay(
                    tokenID: tokenID,
                    name: display.name,
                    description: display.description,
                    thumbnail: display.thumbnail.uri()
                  )
              }
          }
      }

      return NFTs
  }
  `

  if (nft.contractName == "FLOAT") {
    rawCode = `
    pub struct NFTDisplay {
      pub let tokenID: UInt64
      pub let name: String
      pub let description: String
      pub let thumbnail: String
  
      init(tokenID: UInt64, name: String, description: String, thumbnail: String) {
        self.tokenID = tokenID
        self.name = name
        self.description = description
        self.thumbnail = thumbnail
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
                        thumbnail: display.thumbnail.uri()
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

  console.log(code)

  const event = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address)
    ]
  }) 

  return event
}

