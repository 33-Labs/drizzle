import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import { txHandler, TxStatus } from "./transactions"

const NonFungibleTokenPath = "0xNonFungibleToken"
const MistPath = "0xMist"
const MetadataViewsPath = "0xMetadataViews"
const EligibilityReviewersPath = "0xEligibilityVerifiers"

export const createRaffle = async (
  name, description, image, url,
  startAt, endAt, registeryEndAt, numberOfWinners, 
  // NFT info
  nftCatalogCollectionID,
  nftContractAddress,
  nftContractName,
  nftDisplayName,
  nftCollectionStoragePath,
  nftCollectionPublicPath,
  rewardTokenIDs,
  // whitelist
  withWhitelist,
  whitelist,
  // Floats
  withFloats, threshold, eventIDs, eventHosts,
  withFloatGroup, groupName, groupHost,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doCreateRaffle(
      name, description, image, url,
      startAt, endAt, registeryEndAt, numberOfWinners, 
      nftCatalogCollectionID,
      nftContractAddress,
      nftContractName,
      nftDisplayName,
      nftCollectionStoragePath,
      nftCollectionPublicPath,
      rewardTokenIDs,
      withWhitelist,
      whitelist,
      withFloats, threshold, eventIDs, eventHosts,
      withFloatGroup, groupName, groupHost
    )
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus) 
}

const doCreateRaffle = async (
  name, description, image, url,
  startAt, endAt, registeryEndAt, numberOfWinners, 
  nftCatalogCollectionID,
  nftContractAddress,
  nftContractName,
  nftDisplayName,
  nftCollectionStoragePath,
  nftCollectionPublicPath,
  rewardTokenIDs,
  withWhitelist,
  whitelist,
  withFloats, threshold, eventIDs, eventHosts,
  withFloatGroup, groupName, groupHost
) => {
  const code = `
  import Mist from 0xMist
  import EligibilityVerifiers from 0xEligibilityVerifiers
  import MetadataViews from 0xMetadataViews
  import ${nftContractName} from ${nftContractAddress}
  
  transaction(
      name: String,
      description: String,
      image: String?,
      url: String?,
      startAt: UFix64?,
      endAt: UFix64?,
      registeryEndAt: UFix64,
      numberOfWinners: UInt64,
      // NFTInfo
      nftCatalogCollectionID: String,
      nftContractAddress: Address,
      nftContractName: String,
      nftDisplayName: String,
      nftCollectionStoragePath: String,
      nftCollectionPublicPath: String,
      rewardTokenIDs: [UInt64],
      // EligibilityVerifier
      // Only support registrationVerify now
      withWhitelist: Bool,
      whitelist: {Address: Bool},
  
      withFloats: Bool,
      threshold: UInt32?,
      eventIDs: [UInt64],
      eventHosts: [Address],
  
      withFloatGroup: Bool,
      floatGroupName: String?,
      floatGroupHost: Address?
  ) {
      let raffleCollection: &Mist.RaffleCollection
      let nftCollectionRef: &${nftContractName}.Collection
      let rewardDisplays: {UInt64: MetadataViews.Display}
  
      prepare(acct: AuthAccount) {
          if acct.borrow<&Mist.RaffleCollection>(from: Mist.RaffleCollectionStoragePath) == nil {
              acct.save(<- Mist.createEmptyRaffleCollection(), to: Mist.RaffleCollectionStoragePath)
              let cap = acct.link<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>(
                  Mist.RaffleCollectionPublicPath,
                  target: Mist.RaffleCollectionStoragePath
              ) ?? panic("Could not link RaffleCollection to PublicPath")
          }
  
          self.raffleCollection = acct.borrow<&Mist.RaffleCollection>(from: Mist.RaffleCollectionStoragePath)
              ?? panic("Could not borrow RaffleCollection from signer")
  
          let nftStoragePath = StoragePath(identifier: nftCollectionStoragePath)!
          self.nftCollectionRef = acct.borrow<&${nftContractName}.Collection>(from: nftStoragePath)
              ?? panic("Could not borrow collection from signer")

          self.rewardDisplays = {}
          for tokenID in rewardTokenIDs {
              let resolver = self.nftCollectionRef.borrowViewResolver(id: tokenID)
              let display = MetadataViews.getDisplay(resolver)!
              self.rewardDisplays[tokenID] = display
          } 
      }
  
      execute {
          let nftInfo = Mist.NFTInfo(
              nftCatalogCollectionID: nftCatalogCollectionID,
              contractName: nftContractName,
              contractAddress: nftContractAddress,
              displayName: nftDisplayName,
              nftCollectionStoragePath: StoragePath(identifier: nftCollectionStoragePath)!,
              nftCollectionPublicPath: PublicPath(identifier: nftCollectionPublicPath)!
          )
          
          var verifier: {EligibilityVerifiers.IEligibilityVerifier}? = nil
          if withWhitelist {
              verifier = EligibilityVerifiers.Whitelist(
                  whitelist: whitelist
              )
          } else if withFloats {
              assert(eventIDs.length == eventHosts.length, message: "eventIDs should have the same length with eventHosts")
              let events: [EligibilityVerifiers.FLOATEventData] = []
              var counter = 0
              while counter < eventIDs.length {
                  let event = EligibilityVerifiers.FLOATEventData(host: eventHosts[counter], eventID: eventIDs[counter])
                  events.append(event)
                  counter = counter + 1
              }
              verifier = EligibilityVerifiers.FLOATs(
                  events: events,
                  threshold: threshold!
              )
          } else if withFloatGroup {
              let groupData = EligibilityVerifiers.FLOATGroupData(
                  host: floatGroupHost!,
                  name: floatGroupName!
              )
              verifier = EligibilityVerifiers.FLOATGroup(
                  group: groupData,
                  threshold: threshold!
              )
          } else {
              panic("invalid verifier")
          }
  
          let collection <- ${nftContractName}.createEmptyCollection()
          let raffleID = self.raffleCollection.createRaffle(
              name: name, 
              description: description, 
              host: self.nftCollectionRef.owner!.address, 
              image: image,
              url: url,
              startAt: startAt,
              endAt: endAt,
              registeryEndAt: registeryEndAt,
              numberOfWinners: numberOfWinners,
              nftInfo: nftInfo,
              collection: <- collection,
              registrationVerifyMode: EligibilityVerifiers.VerifyMode.all,
              claimVerifyMode: EligibilityVerifiers.VerifyMode.all,
              registrationVerifiers: [verifier!],
              claimVerifiers: [],
              extraData: {}
          )
  
          let raffle = self.raffleCollection.borrowRaffleRef(raffleID: raffleID)!
          for tokenID in rewardTokenIDs {
              let token <- self.nftCollectionRef.withdraw(withdrawID: tokenID)
              let display = self.rewardDisplays[tokenID]!
              raffle.deposit(token: <- token, display: display)
          }
      }
  }
    `
    .replace(MistPath, publicConfig.mistAddress)
    .replace(EligibilityReviewersPath, publicConfig.eligibilityVerifiersAddress)
    .replace(MetadataViewsPath, publicConfig.metadataViewsAddress)

  console.log(code)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => {
      const args = [
        arg(name, t.String),
        arg(description, t.String),
        arg(image, t.Optional(t.String)),
        arg(url, t.Optional(t.String)),
        arg(startAt, t.Optional(t.UFix64)),
        arg(endAt, t.Optional(t.UFix64)),
        arg(registeryEndAt, t.UFix64),
        arg(numberOfWinners, t.UInt64),
        arg(nftCatalogCollectionID, t.String),
        arg(nftContractAddress, t.Address),
        arg(nftContractName, t.String),
        arg(nftDisplayName, t.String),
        arg(nftCollectionStoragePath, t.String),
        arg(nftCollectionPublicPath, t.String),
        arg(rewardTokenIDs, t.Array(t.UInt64)),
        arg(withWhitelist, t.Bool),
        arg(whitelist, t.Dictionary({ key: t.Address, value: t.Bool })),
        arg(withFloats, t.Bool),
        arg(threshold, t.Optional(t.UInt32)),
        arg(eventIDs, t.Array(t.UInt64)),
        arg(eventHosts, t.Array(t.Address)),
        arg(withFloatGroup, t.Bool),
        arg(groupName, t.Optional(t.String)),
        arg(groupHost, t.Optional(t.Address))
      ]

      return args
    },
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}