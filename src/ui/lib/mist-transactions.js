import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import { txHandler, TxStatus } from "./transactions"
import { generateImportsAndInterfaces } from "./utils"

const NonFungibleTokenPath = "0xNonFungibleToken"
const MistPath = "0xMist"
const MetadataViewsPath = "0xMetadataViews"
const EligibilityReviewersPath = "0xEligibilityVerifiers"
const DrizzleRecorderPath = "0xDrizzleRecorder"

export const createRaffle = async (
  name, description, image, url,
  startAt, endAt, registrationEndAt, numberOfWinners, 
  // NFT info
  nftName,
  nftTypeIdentifier,
  nftContractName,
  nftContractAddress,
  nftCollectionTypeIdentifier,
  nftCollectionTypeRestrictions,
  nftCollectionLogoURL,
  nftCollectionPublicPath,
  nftCollectionStoragePath,
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
      startAt, endAt, registrationEndAt, numberOfWinners, 
      nftName,
      nftTypeIdentifier,
      nftContractName,
      nftContractAddress,
      nftCollectionTypeIdentifier,
      nftCollectionTypeRestrictions,
      nftCollectionLogoURL,
      nftCollectionPublicPath,
      nftCollectionStoragePath,
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
  startAt, endAt, registrationEndAt, numberOfWinners, 
  nftName,
  nftTypeIdentifier,
  nftContractName,
  nftContractAddress,
  nftCollectionTypeIdentifier,
  nftCollectionTypeRestrictions,
  nftCollectionLogoURL,
  nftCollectionPublicPath,
  nftCollectionStoragePath,
  rewardTokenIDs,
  withWhitelist,
  whitelist,
  withFloats, threshold, eventIDs, eventHosts,
  withFloatGroup, groupName, groupHost
) => {
  const code = `
  import Mist from 0xMist
  import EligibilityVerifiers from 0xEligibilityVerifiers
  import ${nftContractName} from ${nftContractAddress}
  import MetadataViews from 0xMetadataViews
  
  transaction(
      name: String,
      description: String,
      image: String?,
      url: String?,
      startAt: UFix64?,
      endAt: UFix64?,
      registrationEndAt: UFix64,
      numberOfWinners: UInt64,
      // NFTInfo
      nftName: String,
      nftTypeIdentifier: String,
      nftContractName: String,
      nftContractAddress: Address,
      nftCollectionTypeIdentifier: String,
      nftCollectionTypeRestrictions: [String],
      nftCollectionLogoURL: String,
      nftCollectionPublicPath: String,
      nftCollectionStoragePath: String,
  
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
      let rewardDisplays: {UInt64: Mist.NFTDisplay}
  
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
              let mDisplay = MetadataViews.getDisplay(resolver)!
              // Mist.NFTDisplay has no extraData field, we put rarity desc to description temporarily
              var desc = mDisplay.description
              if let mRarity = MetadataViews.getRarity(resolver) {
                  if let rarityDesc = mRarity.description {
                      desc = rarityDesc
                  }
              }
              let display = Mist.NFTDisplay(
                  tokenID: tokenID,
                  name: mDisplay.name,
                  description: desc,
                  thumbnail: mDisplay.thumbnail.uri()
              )
              self.rewardDisplays[tokenID] = display
          } 
      }
  
      execute {
          assert(UInt64(rewardTokenIDs.length) >= numberOfWinners, message: "reward number is not enough")
  
          let nftInfo = Mist.NFTInfo(
              name: nftName,
              nftType: CompositeType(nftTypeIdentifier)!,
              contractName: nftContractName,
              contractAddress: nftContractAddress,
              collectionType: RestrictedType(
                  identifier: nftCollectionTypeIdentifier,
                  restrictions: nftCollectionTypeRestrictions
              )!,
              collectionLogoURL: nftCollectionLogoURL,
              collectionStoragePath: StoragePath(identifier: nftCollectionStoragePath)!,
              collectionPublicPath: PublicPath(identifier: nftCollectionPublicPath)!
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
              verifier = EligibilityVerifiers.FLOATsV2(
                  events: events,
                  mintedBefore: getCurrentBlock().timestamp,
                  threshold: threshold!
              )
          } else if withFloatGroup {
              let groupData = EligibilityVerifiers.FLOATGroupData(
                  host: floatGroupHost!,
                  name: floatGroupName!
              )
              verifier = EligibilityVerifiers.FLOATGroupV2(
                  group: groupData,
                  mintedBefore: getCurrentBlock().timestamp,
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
              registrationEndAt: registrationEndAt,
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
        arg(registrationEndAt, t.UFix64),
        arg(numberOfWinners, t.UInt64),

        arg(nftName, t.String),
        arg(nftTypeIdentifier, t.String),
        arg(nftContractName, t.String),
        arg(nftContractAddress, t.Address),
        arg(nftCollectionTypeIdentifier, t.String),
        arg(nftCollectionTypeRestrictions, t.Array(t.String)),
        arg(nftCollectionLogoURL, t.String),
        arg(nftCollectionPublicPath, t.String),
        arg(nftCollectionStoragePath, t.String),

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

export const register = async (
  raffleID, host,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRegister(raffleID, host)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus) 
}


const doRegister = async (
  raffleID, host
) => {
  const code = `
  import NonFungibleToken from 0xNonFungibleToken
  import Mist from 0xMist
  import DrizzleRecorder from 0xDrizzleRecorder
  
  transaction(raffleID: UInt64, host: Address) {
      let raffle: &{Mist.IRafflePublic}
      let address: Address
      let recorderRef: &DrizzleRecorder.Recorder
  
      prepare(acct: AuthAccount) {
          self.address = acct.address
  
          let raffleCollection = getAccount(host)
              .getCapability(Mist.RaffleCollectionPublicPath)
              .borrow<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>()
              ?? panic("Could not borrow the public RaffleCollection from the host")
          
          let raffle = raffleCollection.borrowPublicRaffleRef(raffleID: raffleID)
              ?? panic("Could not borrow the public Raffle from the collection")

          if (acct.borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath) == nil) {
              acct.save(<-DrizzleRecorder.createEmptyRecorder(), to: DrizzleRecorder.RecorderStoragePath)
  
              acct.link<&{DrizzleRecorder.IRecorderPublic}>(
                  DrizzleRecorder.RecorderPublicPath,
                  target: DrizzleRecorder.RecorderStoragePath
              )
            }
  
          self.raffle = raffle 
          self.recorderRef = acct
            .borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath)
            ?? panic("Could not borrow Recorder")
      }
  
      execute {
        self.raffle.register(account: self.address, params: {
          "recorderRef": self.recorderRef
        })
      }
  }
    `
    .replace(MistPath, publicConfig.mistAddress)
    .replace(NonFungibleTokenPath, publicConfig.nonFungibleTokenAddress)
    .replace(DrizzleRecorderPath, publicConfig.drizzleRecorderAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => {
      const args = [
        arg(raffleID, t.UInt64),
        arg(host, t.Address),
      ]

      return args
    },
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

export const togglePause = async (
  raffleID,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doTogglePause(raffleID)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doTogglePause = async (raffleID) => {
  const code = `
  import Mist from 0xMist

  transaction(raffleID: UInt64) {
      let raffle: &Mist.Raffle
  
      prepare(acct: AuthAccount) {
          let raffleCollection = acct.borrow<&Mist.RaffleCollection>(from: Mist.RaffleCollectionStoragePath)
              ?? panic("Could not borrow raffleCollection")
  
          self.raffle = raffleCollection.borrowRaffleRef(raffleID: raffleID)!
      }
  
      execute {
          self.raffle.togglePause()
      }
  }
  `
    .replace(MistPath, publicConfig.mistAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => (
      [arg(raffleID, t.UInt64)]
    ),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const draw = async (
  raffleID,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doDraw(raffleID)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doDraw = async (raffleID) => {
  const code = `
  import Mist from 0xMist

  transaction(raffleID: UInt64) {
      let raffle: &Mist.Raffle
  
      prepare(acct: AuthAccount) {
          let raffleCollection = acct.borrow<&Mist.RaffleCollection>(from: Mist.RaffleCollectionStoragePath)
              ?? panic("Could not borrow raffleCollection")
          self.raffle = raffleCollection.borrowRaffleRef(raffleID: raffleID)!
      }
  
      execute {
          self.raffle.draw(params: {})
      }
  }
  `
  .replace(MistPath, publicConfig.mistAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => ([
      arg(raffleID, t.UInt64)
    ]),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const batchDraw = async (
  raffleID,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doBatchDraw(raffleID)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doBatchDraw = async (raffleID) => {
  const code = `
  import Mist from 0xMist

  transaction(raffleID: UInt64) {
      let raffle: &Mist.Raffle
  
      prepare(acct: AuthAccount) {
          let raffleCollection = acct.borrow<&Mist.RaffleCollection>(from: Mist.RaffleCollectionStoragePath)
              ?? panic("Could not borrow raffleCollection")
          self.raffle = raffleCollection.borrowRaffleRef(raffleID: raffleID)!
      }
  
      execute {
          self.raffle.batchDraw(params: {})
      }
  }
  `
  .replace(MistPath, publicConfig.mistAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => ([
      arg(raffleID, t.UInt64)
    ]),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const endRaffle = async (
  raffleID, nftContractName, nftContractAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doEndRaffle(raffleID, nftContractName, nftContractAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

export const deleteRaffle = async (
  raffleID, nftContractName, nftContractAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doDeleteRaffle(raffleID, nftContractName, nftContractAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doDeleteRaffle = async (
  raffleID, nftContractName, nftContractAddress
) => {
  const code = `
  import Mist from 0xMist
  import NonFungibleToken from 0xNonFungibleToken
  import ${nftContractName} from ${nftContractAddress}
  
  transaction(raffleID: UInt64) {
      let raffleCollection: &Mist.RaffleCollection
      let nftCollectionRef: &${nftContractName}.Collection{NonFungibleToken.CollectionPublic}
  
      prepare(acct: AuthAccount) {
          self.raffleCollection = acct.borrow<&Mist.RaffleCollection>(from: Mist.RaffleCollectionStoragePath)
              ?? panic("Could not borrow raffleCollection")
  
          let raffle = self.raffleCollection.borrowRaffleRef(raffleID: raffleID)!
  
          self.nftCollectionRef = acct.borrow<&${nftContractName}.Collection{NonFungibleToken.CollectionPublic}>(from: raffle.nftInfo.collectionStoragePath)
              ?? panic("Could not borrow collection from signer")
      }
  
      execute {
          self.raffleCollection.deleteRaffle(raffleID: raffleID, receiver: self.nftCollectionRef)
      }
  }
  `
  .replace(NonFungibleTokenPath, publicConfig.nonFungibleTokenAddress)
  .replace(MistPath, publicConfig.mistAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => ([
      arg(raffleID, t.UInt64)
    ]),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

const doEndRaffle = async (
  raffleID, nftContractName, nftContractAddress
) => {
  const code = `
  import Mist from 0xMist
  import NonFungibleToken from 0xNonFungibleToken
  import ${nftContractName} from ${nftContractAddress}
  
  transaction(raffleID: UInt64) {
      let raffle: &Mist.Raffle
      let nftCollectionRef: &${nftContractName}.Collection{NonFungibleToken.CollectionPublic}
  
      prepare(acct: AuthAccount) {
          let raffleCollection = acct.borrow<&Mist.RaffleCollection>(from: Mist.RaffleCollectionStoragePath)
              ?? panic("Could not borrow raffleCollection")
  
          self.raffle = raffleCollection.borrowRaffleRef(raffleID: raffleID)!
  
          self.nftCollectionRef = acct.borrow<&${nftContractName}.Collection{NonFungibleToken.CollectionPublic}>(from: self.raffle.nftInfo.collectionStoragePath)
              ?? panic("Could not borrow collection from signer")
      }
  
      execute {
          self.raffle.end(receiver: self.nftCollectionRef)
      }
  }
  `
  .replace(NonFungibleTokenPath, publicConfig.nonFungibleTokenAddress)
  .replace(MistPath, publicConfig.mistAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => ([
      arg(raffleID, t.UInt64)
    ]),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const claim = async (
  raffleID, host, nftInfo,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doClaim(raffleID, host, nftInfo)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doClaim = async (
  raffleID,
  host,
  nftInfo
) => {
  const nftContractName = nftInfo.contractName
  const storagePath = `/storage/${nftInfo.collectionStoragePath.identifier}`
  const publicPath = `/public/${nftInfo.collectionPublicPath.identifier}`

  const restrictions = nftInfo.collectionType.restrictions.map((r) => r.typeID)
  const [imports, interfaces] = generateImportsAndInterfaces(restrictions)

  const rawCode = `
  import Mist from 0xMist
  import DrizzleRecorder from 0xDrizzleRecorder
  
  transaction(raffleID: UInt64, host: Address) {
      let raffle: &{Mist.IRafflePublic}
      let receiver: &{NonFungibleToken.CollectionPublic}
      let recorderRef: &DrizzleRecorder.Recorder
  
      prepare(acct: AuthAccount) {
          let raffleCollection = getAccount(host)
              .getCapability(Mist.RaffleCollectionPublicPath)
              .borrow<&Mist.RaffleCollection{Mist.IRaffleCollectionPublic}>()
              ?? panic("Could not borrow the public RaffleCollection from the host")
          
          let raffle = raffleCollection.borrowPublicRaffleRef(raffleID: raffleID)
              ?? panic("Could not borrow the public Raffle from the collection")
          
          if acct.borrow<&NonFungibleToken.Collection>(from: ${storagePath}) != nil 
            && !acct.getCapability<&{${interfaces}}>(${publicPath}).check() {
            acct.unlink(${publicPath})
            acct.link<&{${interfaces}}>(
              ${publicPath},
              target: ${storagePath}
            )
          } else if (acct.borrow<&${nftContractName}.Collection>(from: ${storagePath}) == nil) {
              acct.save(<-${nftContractName}.createEmptyCollection(), to: ${storagePath})
  
              acct.link<&{${interfaces}}>(
                  ${publicPath},
                  target: ${storagePath}
              )
          }

          if (acct.borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath) == nil) {
            acct.save(<-DrizzleRecorder.createEmptyRecorder(), to: DrizzleRecorder.RecorderStoragePath)

            acct.link<&{DrizzleRecorder.IRecorderPublic}>(
                DrizzleRecorder.RecorderPublicPath,
                target: DrizzleRecorder.RecorderStoragePath
            )
          }
          
          self.raffle = raffle 
          self.receiver = acct
              .getCapability(${publicPath})
              .borrow<&{NonFungibleToken.CollectionPublic}>()
              ?? panic("Could not borrow Receiver")

          self.recorderRef = acct
            .borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath)
            ?? panic("Could not borrow Recorder")
      }
  
      execute {
        self.raffle.claim(receiver: self.receiver, params: {
          "recorderRef": self.recorderRef
        })
      }
  }
  `
  .replace(MistPath, publicConfig.mistAddress)
  .replace(DrizzleRecorderPath, publicConfig.drizzleRecorderAddress)

  const code = imports.concat(rawCode)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => (
      [
        arg(raffleID, t.UInt64),
        arg(host, t.Address)
      ]
    ),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}