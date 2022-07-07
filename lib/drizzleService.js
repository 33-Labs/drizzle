import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import Decimal from 'decimal.js'

const FungibleTokenPath = "0xFungibleToken"
const DrizzlePath = "0xDrizzle"
const DropNPath = "0xDropN"

const queryClaimStatus = async (
  dropID,
  host,
  claimer
) => {
  const code = `
  import Drizzle from 0xDrizzle
  import DropN from 0xDropN

  pub struct ClaimStatus {
    pub let message: String
    pub let claimable: Bool
    pub let amount: UFix64?

    init(message: String, claimable: Bool, amount: UFix64?) {
        self.message = message
        self.claimable = claimable
        self.amount = amount
    }
  }

  pub fun main(dropID: UInt64, host: Address, claimer: Address): ClaimStatus {
    let dropCollection =
        getAccount(host)
        .getCapability(DropN.DropCollectionPublicPath)
        .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
        ?? panic("Could not borrow IDropCollectionPublic from address")

    let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
        ?? panic("Could not borrow drop")

    let claimableAmount = drop.getClaimableAmount(address: claimer)

    if claimableAmount == nil {
        return ClaimStatus(message: "not eligible", claimable: false, amount: nil)
    }

    if !drop.isClaimable {
        return ClaimStatus(message: "not claimable", claimable: false, amount: claimableAmount!)
    }

    if let startAt = drop.startAt {
        if getCurrentBlock().timestamp >= startAt {
            return ClaimStatus(message: "not start", claimable: false, amount: claimableAmount!)    
        }
    }

    if let endAt = drop.endAt {
        if getCurrentBlock().timestamp <= endAt {
            return ClaimStatus(message: "ended", claimable: false, amount: claimableAmount!)
        }
    }

    if let amount = drop.hasClaimed(address: claimer) {
        return ClaimStatus(message: "claimed", claimable: false, amount: amount)
    }

    return ClaimStatus(message: "eligible", claimable: true, amount: claimableAmount!)
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropNPath, publicConfig.dropNAddress)

  const status = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(dropID, t.UInt64),
      arg(host, t.Address),
      arg(claimer, t.Address),
    ]
  }) 

  return status
}

const testTx = async () => {
  const code = `
  transaction() {
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

const claim = async (
  dropID,
  host,
  tokenIssuer,
  tokenContractName,
  tokenProviderPath,
  tokenBalancePath,
  tokenReceiverPath
) => {
  const code = `
  import Drizzle from 0xDrizzle
  import DropN from 0xDropN
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
  .replace(DropNPath, publicConfig.dropNAddress)

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


const createDropN = async (
  name,
  description,
  image,
  url,
  claims,
  startAt,
  endAt,
  tokenIssuer,
  tokenContractName,
  tokenSymbol,
  tokenProviderPath,
  tokenBalancePath,
  tokenReceiverPath,
  tokenAmount
) => {
  const code = `
  import Drizzle from 0xDrizzle
  import DropN from 0xDropN
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
  .replace(DropNPath, publicConfig.dropNAddress)

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
        arg(tokenAmount, t.UFix64)
      ]
    ),
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId 
}

const queryClaimableAmount = async (dropID, host, claimer) => {
  const code = `
  import Drizzle from 0xDrizzle
  import DropN from 0xDropN

  pub fun main(dropID: UInt64, host: Address, claimer: Address): UFix64? {
      let dropCollection =
          getAccount(host)
          .getCapability(DropN.DropCollectionPublicPath)
          .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")

      let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow drop")

      return drop.getClaimableAmount(address: claimer)    
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropNPath, publicConfig.dropNAddress)

  const amount = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(dropID, t.UInt64),
      arg(host, t.Address),
      arg(claimer, t.Address),
    ]
  }) 

  return amount
}

const queryDrop = async (address, dropID) => {
  const code = `
  import Drizzle from 0xDrizzle
  import DropN from 0xDropN

  pub fun main(address: Address, dropID: UInt64): &{Drizzle.IDropPublic} {
      let dropCollection =
          getAccount(address)
          .getCapability(DropN.DropCollectionPublicPath)
          .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")

      let dropRef = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow publicDropRef")

      return dropRef
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropNPath, publicConfig.dropNAddress)

  const drop = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(dropID, t.UInt64)
    ]
  }) 

  return drop
}

const queryBalance = async (token, address) => {
  const code = `
    import FungibleToken from 0xFungibleToken
    import ${token.contractName} from ${token.address}
    
    pub fun main(address: Address): UFix64 {
        let account = getAccount(address)
    
        let vaultRef = account
            .getCapability(${token.path.balance})
            .borrow<&${token.contractName}.Vault{FungibleToken.Balance}>()
         
        if let vault = vaultRef {
          return vault.balance
        }
        return 0.0
    }
  `
  .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)

  const balance = await fcl.query({
    cadence: code,
    args: (arg, t) => [arg(address, t.Address)]
  }) 

  return new Decimal(balance ?? 0.0)
}

const queryDropNs = async (address) => {
  const code = `
    import Drizzle from 0xDrizzle
    import DropN from 0xDropN

    pub fun main(address: Address): {UInt64: &{Drizzle.IDropPublic}} {
      let dropCollection =
          getAccount(address)
          .getCapability(DropN.DropCollectionPublicPath)
          .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
  
      if let collection = dropCollection {
          return collection.getAllDrops()
      }
  
      return {}
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropNPath, publicConfig.dropNAddress)

  const drops = await fcl.query({
    cadence: code,
    args: (arg, t) => [arg(address, t.Address)]
  }) 

  return drops ?? []
}

const queryReceiver = async (token, address) => {
  const code = `
    import FungibleToken from 0xFungibleToken
    import ${token.contractName} from ${token.address}
    
    pub fun main(address: Address): Bool {
        let account = getAccount(address)
    
        let vaultRef = account
            .getCapability(${token.path.receiver})
            .borrow<&${token.contractName}.Vault{FungibleToken.Receiver}>()
        
        if let vault = vaultRef {
          return true
        }
        return false 
    }
  `
  .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)

  const prepared = await fcl.query({
    cadence: code,
    args: (arg, t) => [arg(address, t.Address)]
  }) 

  return prepared ?? false
}

const drizzleService = {
  testTx,
  claim,
  createDropN,
  queryDropNs,
  queryDrop,
  queryClaimableAmount,
  queryClaimStatus,
  queryBalance,
}

export default drizzleService