import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

// Different from the response of FCL
// We don't need to show every status to users
const TxStatus = {
  // Initializing: Initialing
  // the transaction is waiting to be approved
  initializing() {
    return {status: "Initializing", error: null, txid: null}
  },
  // Pending: Pending & Finalized & Executed
  // the transaction has not been confirmed on chain
  pending(txid) {
    return {status: "Pending", error: null, txid: txid}
  },
  // Success: Sealed with no error
  success(txid) {
    return {status: "Success", error: null, txid: txid}
  },
  // Failed: Sealed with error
  failed(error, txid) {
    return {status: "Failed", error: error, txid: txid}
  }
}

const FungibleTokenPath = "0xFungibleToken"
const DrizzlePath = "0xDrizzle"
const DropPath = "0xDrop"

export const createDrop = async (
  name, description, image, url, claims,
  startAt, endAt, token, amount,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doCreateDrop(
      name, description, image, url, claims,
      startAt, endAt, token, amount
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
  name,
  description,
  image,
  url,
  claims,
  startAt,
  endAt,
  // Token from flow-token-list
  token,
  amount
) => {
  const tokenIssuer = token.address
  const tokenContractName = token.contractName
  const tokenSymbol = token.symbol
  const tokenProviderPath = token.path.vault.replace("/storage/", "")
  const tokenBalancePath = token.path.balance.replace("/public/", "")
  const tokenReceiverPath = token.path.receiver.replace("/public/", "")

  const code = `
  import Drizzle from 0xDrizzle
  import DropN from 0xDrop
  import FungibleToken from 0xFungibleToken

  transaction(
      name: String,
      description: String,
      image: String?,
      url: String?,
      claims: {Address: UFix64},
      startAt: UFix64?,
      endAt: UFix64?,
      tokenIssuer: Address,
      tokenContractName: String,
      tokenSymbol: String,
      tokenProviderPath: String,
      tokenBalancePath: String,
      tokenReceiverPath: String,
      tokenAmount: UFix64 
  ) {
      let dropCollection: &DropN.DropCollection
      let vault: &FungibleToken.Vault

      prepare(acct: AuthAccount) {
          if acct.borrow<&DropN.DropCollection>(from: DropN.DropCollectionStoragePath) == nil {
              acct.save(<- DropN.createEmptyDropCollection(), to: DropN.DropCollectionStoragePath)
              acct.link<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>(
                  DropN.DropCollectionPublicPath,
                  target: DropN.DropCollectionStoragePath
              )
          }

          self.dropCollection = acct.borrow<&DropN.DropCollection>(from: DropN.DropCollectionStoragePath)
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

          self.dropCollection.createDrop(
              name: name, 
              description: description, 
              host: self.vault.owner!.address, 
              image: image,
              url: url,
              tokenInfo: tokenInfo,
              vault: <- dropVault, 
              claims: claims,
              startAt: startAt,
              endAt: endAt
          )
      }
  }
  `
  .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropPath, publicConfig.dropAddress)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => (
      [
        arg(name, t.String), 
        arg(description, t.String),
        arg(image, t.Optional(t.String)),
        arg(url, t.Optional(t.String)),
        arg(claims, t.Dictionary({key: t.Address, value: t.UFix64})),
        arg(startAt, t.Optional(t.UFix64)),
        arg(endAt, t.Optional(t.UFix64)),
        arg(tokenIssuer, t.Address),
        arg(tokenContractName, t.String),
        arg(tokenSymbol, t.String),
        arg(tokenProviderPath, t.String),
        arg(tokenBalancePath, t.String),
        arg(tokenReceiverPath, t.String),
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
  import Drizzle from 0xDrizzle
  import DropN from 0xDrop
  import FungibleToken from 0xFungibleToken
  import ${tokenContractName} from ${tokenIssuer}

  transaction(dropID: UInt64, host: Address) {
      let drop: &{Drizzle.IDropPublic}
      let receiver : &${tokenContractName}.Vault{FungibleToken.Receiver}

      prepare(acct: AuthAccount) {
          let dropCollection = getAccount(host)
              .getCapability(DropN.DropCollectionPublicPath)
              .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
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
          
          self.drop = drop
          self.receiver = acct
              .getCapability(receiverPath)
              .borrow<&${tokenContractName}.Vault{FungibleToken.Receiver}>()
              ?? panic("Could not borrow Receiver")
      }

      execute {
          self.drop.claim(receiver: self.receiver, params: {})
      }
  }
  `
  .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropPath, publicConfig.dropAddress)

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