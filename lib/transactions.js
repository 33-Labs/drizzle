import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import { constSelector } from "recoil"

// Different from the response of FCL
// We don't need to show every status to users
const TxStatus = {
  // Initializing: Initialing
  // the transaction is waiting to be approved
  initializing() {
    return { status: "Initializing", error: null, txid: null }
  },
  // Pending: Pending & Finalized & Executed
  // the transaction has not been confirmed on chain
  pending(txid) {
    return { status: "Pending", error: null, txid: txid }
  },
  // Success: Sealed with no error
  success(txid) {
    return { status: "Success", error: null, txid: txid }
  },
  // Failed: Sealed with error
  failed(error, txid) {
    return { status: "Failed", error: error, txid: txid }
  }
}

const FungibleTokenPath = "0xFungibleToken"
const DrizzlePath = "0xDrizzle"
const CloudPath = "0xCloud"
const EligibilityReviewersPath = "0xEligibilityReviewers"
const PacketsPath = "0xPackets"

export const createDrop_FLOATs_Random = async (
  name, description, image, url,
  startAt, endAt, token, 
  eventIDs, eventHosts, capacity, threshold, tokenAmount,
  setTransactionInProgress,
  setTransactionStatus 
) => {
  const txFunc = async () => {
    return await doCreateDrop_FLOATs_Random(
      name, description, image, url, startAt, endAt, 
      token, eventIDs, eventHosts, capacity, threshold, tokenAmount
    )
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)  
}

export const createDrop_FLOATs_Identical = async (
  name, description, image, url,
  startAt, endAt, token, 
  eventIDs, eventHosts, capacity, amountPerPacket, threshold,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doCreateDrop_FLOATs_Identical(
      name, description, image, url, startAt, endAt, 
      token, eventIDs, eventHosts, capacity, amountPerPacket, threshold
    )
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus) 
}

export const createDrop_WhitelistWithAmount = async (
  name, description, image, url,
  startAt, endAt, token, 
  whitelist, amount,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doCreateDrop_WhitelistWithAmount(
      name, description, image, url,
      startAt, endAt, token, whitelist, amount
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

export const withdrawFunds = async (
  dropID, tokenIssuer, tokenReceiverPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doWithdrawFunds(dropID, tokenIssuer, tokenReceiverPath)
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

// name, description, image, url,
// startAt, endAt, token, 
// eventIDs, eventHosts, capacity, amountPerPacket,
// threshold, tokenAmount,
const doCreateDrop_FLOATs_Random = async (
  name,
  description,
  image,
  url,
  startAt,
  endAt,
  // Token from flow-token-list
  token,
  eventIDs, eventHosts, capacity, 
  threshold, tokenAmount
) => {
  const tokenIssuer = token.address
  const tokenContractName = token.contractName
  const tokenSymbol = token.symbol
  const tokenProviderPath = token.path.vault.replace("/storage/", "")
  const tokenBalancePath = token.path.balance.replace("/public/", "")
  const tokenReceiverPath = token.path.receiver.replace("/public/", "")

  const code = `
  import FungibleToken from 0xFungibleToken
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  import EligibilityReviewers from 0xEligibilityReviewers
  import Packets from 0xPackets

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
    // Eligibility
    eventIDs: [UInt64],
    eventHosts: [Address],
    capacity: UInt32,
    threshold: UInt64,
    tokenAmount: UFix64 
  ) {
    let dropCollection: &Cloud.DropCollection
    let vault: &FungibleToken.Vault

    prepare(acct: AuthAccount) {
        if acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath) == nil {
            acct.save(<- Cloud.createEmptyDropCollection(), to: Cloud.DropCollectionStoragePath)
            acct.link<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>(
                Cloud.DropCollectionPublicPath,
                target: Cloud.DropCollectionStoragePath
            )
        }

        self.dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
            ?? panic("Could not borrow DropCollection from signer")

        let providerPath = StoragePath(identifier: tokenProviderPath)!
        self.vault = acct.borrow<&FungibleToken.Vault>(from: providerPath)
            ?? panic("Could not borrow Vault from signer")
    }

    pre {
        eventIDs.length == eventHosts.length: "eventIDs should have the same length with eventHosts"
    }

    execute {
        let dropVault <- self.vault.withdraw(amount: tokenAmount)
        let tokenInfo = Drizzle.TokenInfo(
            account: tokenIssuer,
            contractName: tokenContractName,
            symbol: tokenSymbol,
            providerPath: tokenProviderPath,
            balancePath: tokenBalancePath,
            receiverPath: tokenReceiverPath
        )

        let packet = Packets.RandomPacket(
            capacity: capacity,
            totalAmount: tokenAmount
        )

        let events: [EligibilityReviewers.FLOATEventData] = []
        var counter = 0
        while counter < eventIDs.length {
            let event = EligibilityReviewers.FLOATEventData(host: eventHosts[counter], eventID: eventIDs[counter])
            events.append(event)
            counter = counter + 1
        }

        let reviewer = EligibilityReviewers.FLOATs(
            packet: packet,
            events: events,
            threshold: threshold
        )

        self.dropCollection.createDrop(
            name: name, 
            description: description, 
            host: self.vault.owner!.address, 
            image: image,
            url: url,
            startAt: startAt,
            endAt: endAt,
            tokenInfo: tokenInfo,
            eligibilityReviewer: reviewer, 
            vault: <- dropVault,
        )
    }
  }
    `
    .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
    .replace(DrizzlePath, publicConfig.drizzleAddress)
    .replace(CloudPath, publicConfig.cloudAddress)
    .replace(EligibilityReviewersPath, publicConfig.eligibilityReviewersAddress)
    .replace(PacketsPath, publicConfig.packetsAddress)

    console.log(code)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => (
      [
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
        arg(eventIDs, t.Array(t.UInt64)),
        arg(eventHosts, t.Array(t.Address)),
        arg(capacity, t.UInt32),
        arg(threshold, t.UInt64),
        arg(tokenAmount, t.UFix64)
      ]
    ),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

const doCreateDrop_FLOATs_Identical = async (
  name,
  description,
  image,
  url,
  startAt,
  endAt,
  // Token from flow-token-list
  token,
  eventIDs, eventHosts, capacity, 
  amountPerPacket, threshold
) => {
  const tokenIssuer = token.address
  const tokenContractName = token.contractName
  const tokenSymbol = token.symbol
  const tokenProviderPath = token.path.vault.replace("/storage/", "")
  const tokenBalancePath = token.path.balance.replace("/public/", "")
  const tokenReceiverPath = token.path.receiver.replace("/public/", "")

  const code = `
  import FungibleToken from 0xFungibleToken
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  import EligibilityReviewers from 0xEligibilityReviewers
  import Packets from 0xPackets
  
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
    // Eligibility
    eventIDs: [UInt64],
    eventHosts: [Address],
    capacity: UInt32,
    amountPerPacket: UFix64,
    threshold: UInt64
  ) {
      let dropCollection: &Cloud.DropCollection
      let vault: &FungibleToken.Vault

      prepare(acct: AuthAccount) {
          if acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath) == nil {
              acct.save(<- Cloud.createEmptyDropCollection(), to: Cloud.DropCollectionStoragePath)
              acct.link<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>(
                  Cloud.DropCollectionPublicPath,
                  target: Cloud.DropCollectionStoragePath
              )
          }

          self.dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
              ?? panic("Could not borrow DropCollection from signer")

          let providerPath = StoragePath(identifier: tokenProviderPath)!
          self.vault = acct.borrow<&FungibleToken.Vault>(from: providerPath)
              ?? panic("Could not borrow Vault from signer")
      }

      pre {
          eventIDs.length == eventHosts.length: "eventIDs should have the same length with eventHosts"
      }

      execute {
          let dropVault <- self.vault.withdraw(amount: UFix64(capacity) * amountPerPacket)
          let tokenInfo = Drizzle.TokenInfo(
              account: tokenIssuer,
              contractName: tokenContractName,
              symbol: tokenSymbol,
              providerPath: tokenProviderPath,
              balancePath: tokenBalancePath,
              receiverPath: tokenReceiverPath
          )

          let packet = Packets.IdenticalPacket(
              capacity: capacity,
              amountPerPacket: amountPerPacket
          )

          let events: [EligibilityReviewers.FLOATEventData] = []
          var counter = 0
          while counter < eventIDs.length {
              let event = EligibilityReviewers.FLOATEventData(host: eventHosts[counter], eventID: eventIDs[counter])
              events.append(event)
              counter = counter + 1
          }

          let reviewer = EligibilityReviewers.FLOATs(
              packet: packet,
              events: events,
              threshold: threshold
          )

          self.dropCollection.createDrop(
              name: name, 
              description: description, 
              host: self.vault.owner!.address, 
              image: image,
              url: url,
              startAt: startAt,
              endAt: endAt,
              tokenInfo: tokenInfo,
              eligibilityReviewer: reviewer, 
              vault: <- dropVault,
          )
      }
    }
    `
    .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
    .replace(DrizzlePath, publicConfig.drizzleAddress)
    .replace(CloudPath, publicConfig.cloudAddress)
    .replace(EligibilityReviewersPath, publicConfig.eligibilityReviewersAddress)
    .replace(PacketsPath, publicConfig.packetsAddress)

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
        arg(tokenIssuer, t.Address),
        arg(tokenContractName, t.String),
        arg(tokenSymbol, t.String),
        arg(tokenProviderPath, t.String),
        arg(tokenBalancePath, t.String),
        arg(tokenReceiverPath, t.String),
        arg(eventIDs, t.Array(t.UInt64)),
        arg(eventHosts, t.Array(t.Address)),
        arg(capacity, t.UInt32),
        arg(amountPerPacket, t.UFix64),
        arg(threshold, t.UInt64)
      ]
      console.log(args)
      return args
  },
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

const doCreateDrop_WhitelistWithAmount = async (
  name,
  description,
  image,
  url,
  startAt,
  endAt,
  // Token from flow-token-list
  token,
  whitelist,
  amount
) => {
  const tokenIssuer = token.address
  const tokenContractName = token.contractName
  const tokenSymbol = token.symbol
  const tokenProviderPath = token.path.vault.replace("/storage/", "")
  const tokenBalancePath = token.path.balance.replace("/public/", "")
  const tokenReceiverPath = token.path.receiver.replace("/public/", "")

  const code = `
  import FungibleToken from 0xFungibleToken
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  import EligibilityReviewers from 0xEligibilityReviewers

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
      // Eligibility
      whitelist: {Address: UFix64},
      tokenAmount: UFix64 
  ) {
      let dropCollection: &Cloud.DropCollection
      let vault: &FungibleToken.Vault

      prepare(acct: AuthAccount) {
          if acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath) == nil {
              acct.save(<- Cloud.createEmptyDropCollection(), to: Cloud.DropCollectionStoragePath)
              acct.link<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>(
                  Cloud.DropCollectionPublicPath,
                  target: Cloud.DropCollectionStoragePath
              )
          }

          self.dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
              ?? panic("Could not borrow DropCollection from signer")

          let providerPath = StoragePath(identifier: tokenProviderPath)!
          self.vault = acct.borrow<&FungibleToken.Vault>(from: providerPath)
              ?? panic("Could not borrow Vault from signer")
      }

      execute {
          let dropVault <- self.vault.withdraw(amount: tokenAmount)
          let tokenInfo = Drizzle.TokenInfo(
              account: tokenIssuer,
              contractName: tokenContractName,
              symbol: tokenSymbol,
              providerPath: tokenProviderPath,
              balancePath: tokenBalancePath,
              receiverPath: tokenReceiverPath
          )

          let reviewer = EligibilityReviewers.WhitelistWithAmount(
              whitelist: whitelist
          )

          self.dropCollection.createDrop(
              name: name, 
              description: description, 
              host: self.vault.owner!.address, 
              image: image,
              url: url,
              startAt: startAt,
              endAt: endAt,
              tokenInfo: tokenInfo,
              eligibilityReviewer: reviewer, 
              vault: <- dropVault,
          )
      }
  }
  `
    .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
    .replace(DrizzlePath, publicConfig.drizzleAddress)
    .replace(CloudPath, publicConfig.cloudAddress)
    .replace(EligibilityReviewersPath, publicConfig.eligibilityReviewersAddress)

    console.log(code)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => (
      [
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
        arg(whitelist, t.Dictionary({ key: t.Address, value: t.UFix64 })),
        arg(amount, t.UFix64)
      ]
    ),
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
  import FUSD from 0xFUSD
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  
  transaction(dropID: UInt64, host: Address) {
      let drop: &{Drizzle.IDropPublic}
      let receiver : &FUSD.Vault{FungibleToken.Receiver}
  
      prepare(acct: AuthAccount) {
          let dropCollection = getAccount(host)
              .getCapability(Cloud.DropCollectionPublicPath)
              .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()
              ?? panic("Could not borrow the public DropCollection from the host")
          
          let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
              ?? panic("Could not borrow the public Drop from the collection")
  
          if (acct.borrow<&FUSD.Vault>(from: /storage/fusdVault) == nil) {
              acct.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)
  
              acct.link<&FUSD.Vault{FungibleToken.Receiver}>(
                  /public/fusdReceiver,
                  target: /storage/fusdVault
              )
  
              acct.link<&FUSD.Vault{FungibleToken.Balance}>(
                  /public/fusdBalance,
                  target: /storage/fusdVault
              )
          }
          
          self.drop = drop 
          self.receiver = acct
              .getCapability(/public/fusdReceiver)
              .borrow<&FUSD.Vault{FungibleToken.Receiver}>()
              ?? panic("Could not borrow Receiver")
      }
  
      execute {
          self.drop.claim(receiver: self.receiver, params: {})
      }
  }
  `
    .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
    .replace(DrizzlePath, publicConfig.drizzleAddress)
    .replace(CloudPath, publicConfig.cloudAddress)
    .replace("0xFUSD", tokenIssuer)
    .replace("FUSD", tokenContractName)
    .replace("fusdVault", tokenProviderPath)
    .replace("fusdReceiver", tokenReceiverPath)
    .replace("fusdBalance", tokenBalancePath)

  console.log(code)

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

const doWithdrawAllFunds = async (
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
          self.drop.withdrawAllFunds(receiver: self.receiver)
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
  import FUSD from 0xFUSD
  
  transaction(dropID: UInt64, amount: UFix64) {
      let drop: &Cloud.Drop
      let vault: &FUSD.Vault
  
      prepare(acct: AuthAccount) {
          let dropCollection = acct.borrow<&Cloud.DropCollection>(from: Cloud.DropCollectionStoragePath)
              ?? panic("Could not borrow dropCollection")
  
          self.vault = acct.borrow<&FUSD.Vault>(from: /storage/fusdVault)
              ?? panic("Could not borrow fusdVault")
  
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

  console.log(code)

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

const doTest = async () => {
  const code = `
  transaction(addr: Address) {
    prepare(acct: AuthAccount) {
    }
  }
  `

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

const txHandler = async (
  txFunc,
  setTransactionInProgress,
  setTransactionStatus
) => {
  let transactionId = null
  setTransactionInProgress(true)
  setTransactionStatus(TxStatus.initializing())

  try {
    transactionId = await txFunc()
    setTransactionStatus(TxStatus.pending(transactionId))

    fcl.tx(transactionId).subscribe(res => {
      if (res.status === 4) {
        if (res.statusCode === 0) {
          setTransactionStatus(TxStatus.success(transactionId))
        } else {
          console.log(res.errorMessage)
          setTransactionStatus(TxStatus.failed(res.errorMessage, transactionId))
        }
        setTimeout(() => setTransactionInProgress(false), 3000)
      }
    })

    let res = await fcl.tx(transactionId).onceSealed()
    return res
  } catch (e) {
    setTransactionStatus(TxStatus.failed(e, null))
    console.log(e)
    setTimeout(() => setTransactionInProgress(false), 3000)
  }
}