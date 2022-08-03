import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const NonFungibleTokenPath = "0xNonFungibleToken"
const MetadataViewsPath = "0xMetadataViews"

export const getNFTDisplays = async (account, nft) => {
  let interfaces = nft.collectionType.restrictions.join(", ")
  const code = `
  import NonFungibleToken from 0xNonFungibleToken
  import MetadataViews from 0xMetadataViews
  import ${nft.contractName} from ${nft.contractAddress}

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
              if "${nft.contractName}" == "FLOAT" {
                  if collection.borrowFLOAT(id: tokenID)!.getEventMetadata()?.transferrable != true {
                      continue
                  }
              }
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
  .replace(NonFungibleTokenPath, publicConfig.nonFungibleTokenAddress)
  .replace(MetadataViewsPath, publicConfig.metadataViewsAddress)

  console.log(code)

  const event = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address)
    ]
  }) 

  return event
}

