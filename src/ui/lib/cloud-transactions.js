import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import { txHandler, TxStatus } from "./transactions"

const FungibleTokenPath = "0xFungibleToken"
const CloudPath = "0xCloud"
const EligibilityReviewersPath = "0xEligibilityVerifiers"
const DistributorsPath = "0xDistributors"
const DrizzleRecorderPath = "0xDrizzleRecorder"

export const createDrop = async (
  name, description, image, url,
  startAt, endAt,
  // Token from flow-token-list
  token,
  withExclusiveWhitelist, exclusiveWhitelist, whitelistTokenAmount,
  withWhitelist, whitelist,
  withIdenticalDistributor, capacity, amountPerEntry,
  withRandomDistributor, totalRandomAmount,
  withFloats, threshold, eventIDs, eventHosts,
  withFloatGroup, groupName, groupHost,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doCreateDrop(
      name, description, image, url,
      startAt, endAt,
      // Token from flow-token-list
      token,
      withExclusiveWhitelist, exclusiveWhitelist, whitelistTokenAmount,
      withWhitelist, whitelist,
      withIdenticalDistributor, capacity, amountPerEntry,
      withRandomDistributor, totalRandomAmount,
      withFloats, threshold, eventIDs, eventHosts,
      withFloatGroup, groupName, groupHost
    )
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus) 
}

export const claim = async (
  dropID, host, tokenInfo,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doClaim(dropID, host, tokenInfo)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

export const togglePause = async (
  dropID,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doTogglePause(dropID)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

export const deleteDrop = async (
  dropID, tokenIssuer, tokenReceiverPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doDeleteDrop(dropID, tokenIssuer, tokenReceiverPath)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

export const withdrawAllFunds = async (
  dropID, tokenIssuer, tokenReceiverPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doWithdrawAllFunds(dropID, tokenIssuer, tokenReceiverPath)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

export const endDrop = async (
  dropID, tokenIssuer, tokenReceiverPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doEndDrop(dropID, tokenIssuer, tokenReceiverPath)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

export const depositToDrop = async (
  dropID, tokenInfo, amount,
  setTransactionInProgress,
  setTransactionStatus 
) => {
  const txFunc = async () => {
    return await doDepositToDrop(dropID, tokenInfo, amount)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

export const test = async (
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doTest()
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doCreateDrop = async (
  name, description, image, url,
  startAt, endAt,
  // Token from flow-token-list
  token,
  withExclusiveWhitelist, exclusiveWhitelist, whitelistTokenAmount,
  withWhitelist, whitelist,
  withIdenticalDistributor, capacity, amountPerEntry,
  withRandomDistributor, totalRandomAmount,
  withFloats, threshold, eventIDs, eventHosts,
  withFloatGroup, groupName, groupHost
) => {
  const tokenIssuer = token.address
  const tokenContractName = token.contractName
  const tokenSymbol = token.symbol
  const tokenProviderPath = token.path.vault.replace("/storage/", "")
  const tokenBalancePath = token.path.balance.replace("/public/", "")
  const tokenReceiverPath = token.path.receiver.replace("/public/", "")

  const code = `
  import FungibleToken from 0xFungibleToken
  import Cloud from 0xCloud
  import EligibilityVerifiers from 0xEligibilityVerifiers
  import Distributors from 0xDistributors
  
  transaction(
      name: String,
      description: String,
      image: String?,
      url: String?,
      startAt: UFix64?,
      endAt: UFix64?,
      // TokenInfo
      tokenIssuer: Address,
      tokenContractName: String,
      tokenSymbol: String,
      tokenProviderPath: String,
      tokenBalancePath: String,
      tokenReceiverPath: String,
      // EligibilityVerifier
      // Distributor
      withExclusiveWhitelist: Bool,
      exclusiveWhitelist: {Address: UFix64},
      whitelistTokenAmount: UFix64?,
  
      withWhitelist: Bool,
      whitelist: {Address: Bool},
  
      withIdenticalDistributor: Bool,
      capacity: UInt32?,
      amountPerEntry: UFix64?,
  
      withRandomDistributor: Bool,
      totalRandomAmount: UFix64?,
  
      withFloats: Bool,
      threshold: UInt32?,
      eventIDs: [UInt64],
      eventHosts: [Address],
  
      withFloatGroup: Bool,
      floatGroupName: String?,
      floatGroupHost: Address?
    ) {
      let dropCollection: &Cloud.DropCollection
      let vault: &FungibleToken.Vault
  
      prepare(acct: AuthAccount) {
          if acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath) == nil {
              acct.save(<- Cloud.createEmptyDropCollection(), to: Cloud.DropCollectionStoragePath)
              let cap = acct.link<&Cloud.DropCollection{Cloud.IDropCollectionPublic}>(
                  Cloud.DropCollectionPublicPath,
                  target: Cloud.DropCollectionStoragePath
              ) ?? panic("Could not link DropCollection to PublicPath")
          }
  
          self.dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
              ?? panic("Could not borrow DropCollection from signer")
  
          let providerPath = StoragePath(identifier: tokenProviderPath)!
          self.vault = acct.borrow<&FungibleToken.Vault>(from: providerPath)
              ?? panic("Could not borrow Vault from signer")
      }
  
      execute {
          let tokenInfo = Cloud.TokenInfo(
              account: tokenIssuer,
              contractName: tokenContractName,
              symbol: tokenSymbol,
              providerPath: tokenProviderPath,
              balancePath: tokenBalancePath,
              receiverPath: tokenReceiverPath
          )
          
          var amount: UFix64 = 0.0
          var distributor: {Distributors.IDistributor}? = nil
          if withExclusiveWhitelist {
              distributor = Distributors.Exclusive(distributeList: exclusiveWhitelist)
              amount = whitelistTokenAmount!
          } else if withIdenticalDistributor {
              distributor = Distributors.Identical(
                  capacity: capacity!,
                  amountPerEntry: amountPerEntry!
              )
              amount = UFix64(capacity!) * amountPerEntry!
          } else if withRandomDistributor {
              distributor = Distributors.Random(
                  capacity: capacity!,
                  totalAmount: totalRandomAmount!
              )
              amount = totalRandomAmount!
          } else {
              panic("invalid distributor")
          }
          
          var verifier: {EligibilityVerifiers.IEligibilityVerifier}? = nil
          if withExclusiveWhitelist {
              verifier = EligibilityVerifiers.Whitelist(
                  whitelist: exclusiveWhitelist
              )
          } else if withWhitelist {
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
  
          self.dropCollection.createDrop(
              name: name, 
              description: description, 
              host: self.vault.owner!.address, 
              image: image,
              url: url,
              startAt: startAt,
              endAt: endAt,
              tokenInfo: tokenInfo,
              distributor: distributor!,
              verifyMode: EligibilityVerifiers.VerifyMode.all,
              verifiers: [verifier!], 
              vault: <- self.vault.withdraw(amount: amount),
              extraData: {}
          )
      }
    }
    `
    .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
    .replace(CloudPath, publicConfig.cloudAddress)
    .replace(EligibilityReviewersPath, publicConfig.eligibilityVerifiersAddress)
    .replace(DistributorsPath, publicConfig.distributorsAddress)

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
        arg(tokenIssuer, t.Address),
        arg(tokenContractName, t.String),
        arg(tokenSymbol, t.String),
        arg(tokenProviderPath, t.String),
        arg(tokenBalancePath, t.String),
        arg(tokenReceiverPath, t.String),
        arg(withExclusiveWhitelist, t.Bool),
        arg(exclusiveWhitelist, t.Dictionary({ key: t.Address, value: t.UFix64 })),
        arg(whitelistTokenAmount, t.Optional(t.UFix64)),
        arg(withWhitelist, t.Bool),
        arg(whitelist, t.Dictionary({ key: t.Address, value: t.Bool })),
        arg(withIdenticalDistributor, t.Bool),
        arg(capacity, t.Optional(t.UInt32)),
        arg(amountPerEntry, t.Optional(t.UFix64)),
        arg(withRandomDistributor, t.Bool),
        arg(totalRandomAmount, t.Optional(t.UFix64)),
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

const doClaim = async (
  dropID,
  host,
  // TokenInfo in Drizzle.cdc
  tokenInfo
) => {
  const tokenIssuer = tokenInfo.account
  const tokenContractName = tokenInfo.contractName
  const tokenProviderPath = tokenInfo.providerPath.identifier
  const tokenBalancePath = tokenInfo.balancePath.identifier
  const tokenReceiverPath = tokenInfo.receiverPath.identifier

  const code = `
  import FungibleToken from 0xFungibleToken
  import ${tokenContractName} from ${tokenIssuer}
  import Cloud from 0xCloud
  import DrizzleRecorder from 0xDrizzleRecorder

  transaction(dropID: UInt64, host: Address) {
      let drop: &{Cloud.IDropPublic}
      let receiver : &${tokenContractName}.Vault{FungibleToken.Receiver}
      let recorderRef: &DrizzleRecorder.Recorder

      prepare(acct: AuthAccount) {
          let dropCollection = getAccount(host)
              .getCapability(Cloud.DropCollectionPublicPath)
              .borrow<&Cloud.DropCollection{Cloud.IDropCollectionPublic}>()
              ?? panic("Could not borrow the public DropCollection from the host")
          
          let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
              ?? panic("Could not borrow the public Drop from the collection")

          let providerPath = StoragePath(identifier: "${tokenProviderPath}")!
          let receiverPath = PublicPath(identifier: "${tokenReceiverPath}")!
          let balancePath = PublicPath(identifier: "${tokenBalancePath}")!
          if (acct.borrow<&${tokenContractName}.Vault>(from: providerPath) == nil) {
            acct.save(<-${tokenContractName}.createEmptyVault(), to: providerPath)

            acct.link<&${tokenContractName}.Vault{FungibleToken.Receiver}>(
                receiverPath,
                target: providerPath
            )

            acct.link<&${tokenContractName}.Vault{FungibleToken.Balance}>(
                balancePath,
                target: providerPath
            )
        }

        if (acct.borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath) == nil) {
          acct.save(<-DrizzleRecorder.createEmptyRecorder(), to: DrizzleRecorder.RecorderStoragePath)

          acct.link<&{DrizzleRecorder.IRecorderPublic}>(
              DrizzleRecorder.RecorderPublicPath,
              target: DrizzleRecorder.RecorderStoragePath
          )
        }
          
          self.drop = drop 
          self.receiver = acct
              .getCapability(receiverPath)
              .borrow<&${tokenContractName}.Vault{FungibleToken.Receiver}>()
              ?? panic("Could not borrow Receiver")

          self.recorderRef = acct
              .borrow<&DrizzleRecorder.Recorder>(from: DrizzleRecorder.RecorderStoragePath)
              ?? panic("Could not borrow Recorder")
      }

      execute {
        self.drop.claim(receiver: self.receiver, params: {
          "recorderRef": self.recorderRef
      })
      }
  }
  `
  .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
  .replace(CloudPath, publicConfig.cloudAddress)
  .replace(DrizzleRecorderPath, publicConfig.drizzleRecorderAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => (
      [
        arg(dropID, t.UInt64),
        arg(host, t.Address)
      ]
    ),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

const doTogglePause = async (dropID) => {
  const code = `
  import Cloud from 0xCloud

  transaction(dropID: UInt64) {
      let drop: &Cloud.Drop
  
      prepare(acct: AuthAccount) {
          let dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
              ?? panic("Could not borrow dropCollection")
  
          self.drop = dropCollection.borrowDropRef(dropID: dropID)!
      }
  
      execute {
          self.drop.togglePause()
      }
  }
  `
    .replace(CloudPath, publicConfig.cloudAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => (
      [arg(dropID, t.UInt64)]
    ),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

const doDeleteDrop = async (
  dropID, tokenIssuer, tokenReceiverPath
) => {
  const code = `
  import Cloud from 0xCloud
  import FungibleToken from 0xFungibleToken
  
  transaction(
      dropID: UInt64,
      tokenIssuer: Address,
      tokenReceiverPath: String
  ) {
  
      let dropCollection: &Cloud.DropCollection
      let receiver: &{FungibleToken.Receiver}
  
      prepare(acct: AuthAccount) {
          self.dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
              ?? panic("Could not borrow dropCollection")
  
          let receiverPath = PublicPath(identifier: tokenReceiverPath)!
          self.receiver = acct.getCapability(receiverPath).borrow<&{FungibleToken.Receiver}>()
              ?? panic("Could not borrow Receiver from signer")
      }
  
      execute {
         self.dropCollection.deleteDrop(dropID: dropID, receiver: self.receiver) 
      }
  }
  `
    .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
    .replace(CloudPath, publicConfig.cloudAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => ([
      arg(dropID, t.UInt64),
      arg(tokenIssuer, t.Address),
      arg(tokenReceiverPath, t.String)
    ]),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

const doEndDrop = async (
  dropID, tokenIssuer, tokenReceiverPath
) => {
  const code = `
  import Cloud from 0xCloud
  import FungibleToken from 0xFungibleToken
  
  transaction(
    dropID: UInt64,
    tokenIssuer: Address,
    tokenReceiverPath: String
  ) {

      let drop: &Cloud.Drop
      let receiver: &{FungibleToken.Receiver}

      prepare(acct: AuthAccount) {
          let dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
              ?? panic("Could not borrow dropCollection")
          self.drop = dropCollection.borrowDropRef(dropID: dropID)!

          let receiverPath = PublicPath(identifier: tokenReceiverPath)!
          self.receiver = acct.getCapability(receiverPath).borrow<&{FungibleToken.Receiver}>()
              ?? panic("Could not borrow Receiver from signer")
      }

      execute {
          self.drop.end(receiver: self.receiver)
      }
  }
  `
  .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
  .replace(CloudPath, publicConfig.cloudAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => ([
      arg(dropID, t.UInt64),
      arg(tokenIssuer, t.Address),
      arg(tokenReceiverPath, t.String)
    ]),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

const doDepositToDrop = async (
  dropID, tokenInfo, amount
) => {
  const tokenIssuer = tokenInfo.account
  const tokenContractName = tokenInfo.contractName
  const tokenProviderPath = tokenInfo.providerPath.identifier

  const code = `
  import Cloud from 0xCloud
  import ${tokenContractName} from ${tokenIssuer}
  
  transaction(dropID: UInt64, amount: UFix64) {
      let drop: &Cloud.Drop
      let vault: &${tokenContractName}.Vault
  
      prepare(acct: AuthAccount) {
          let dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
              ?? panic("Could not borrow dropCollection")

          let providerPath = StoragePath(identifier: "${tokenProviderPath}")!
          self.vault = acct.borrow<&${tokenContractName}.Vault>(from: providerPath)
              ?? panic("Could not borrow ${tokenProviderPath}")
  
          self.drop = dropCollection.borrowDropRef(dropID: dropID)!
      }
  
      execute {
          let v <- self.vault.withdraw(amount: amount)
          self.drop.deposit(from: <- v)
      }
  }
  `
  .replace(CloudPath, publicConfig.cloudAddress)
  .replace("0xFUSD", tokenIssuer)
  .replace("FUSD", tokenContractName)
  .replace("fusdVault", tokenProviderPath)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => ([
      arg(dropID, t.UInt64),
      arg(amount, t.UFix64)
    ]),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}