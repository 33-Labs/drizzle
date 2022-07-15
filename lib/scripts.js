import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import Decimal from 'decimal.js'

const FungibleTokenPath = "0xFungibleToken"
const DrizzlePath = "0xDrizzle"
const CloudPath = "0xCloud"

export const queryStats = async (dropID, host) => {
  const code = `
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  
  pub struct DropStats {
      pub let dropBalance: UFix64
      pub let claimed: {Address: Drizzle.ClaimRecord}
      pub let tokenSymbol: String
  
      init(
          dropBalance: UFix64, 
          claimed: {Address: Drizzle.ClaimRecord},
          tokenSymbol: String
      ) {
          self.dropBalance = dropBalance
          self.claimed = claimed
          self.tokenSymbol = tokenSymbol
      }
  }
  
  pub fun main(dropID: UInt64, host: Address): DropStats? {
      let dropCollection =
          getAccount(host)
          .getCapability(Cloud.DropCollectionPublicPath)
          .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")
  
      let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow drop")
  
      let claimedRecords = drop.getClaimedRecords()
      let dropBalance = drop.getDropBalance()
      let tokenSymbol = drop.tokenInfo.symbol
      
      return DropStats(dropBalance: dropBalance, claimed: claimedRecords, tokenSymbol: tokenSymbol)
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(CloudPath, publicConfig.cloudAddress)

  const claimed = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(dropID, t.UInt64),
      arg(host, t.Address)
    ]
  }) 

  return claimed
}

export const queryClaimed = async (dropID, host) => {
  const code = `
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  
  pub fun main(dropID: UInt64, host: Address): {Address: Drizzle.ClaimRecord} {
      let dropCollection =
          getAccount(host)
          .getCapability(Cloud.DropCollectionPublicPath)
          .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")
  
      let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow drop")
      
      return drop.getClaimedRecords()
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(CloudPath, publicConfig.cloudAddress)

  const claimed = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(dropID, t.UInt64),
      arg(host, t.Address)
    ]
  }) 

  return claimed
}

export const queryClaimStatus = async (
  dropID,
  host,
  claimer
) => {
  const code = `
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  
  pub fun main(dropID: UInt64, host: Address, claimer: Address): Drizzle.ClaimStatus {
      let dropCollection =
          getAccount(host)
          .getCapability(Cloud.DropCollectionPublicPath)
          .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")
  
      let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow drop")
  
      return drop.getClaimStatus(account: claimer)
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(CloudPath, publicConfig.cloudAddress)

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

export const queryDrop = async (dropID, host) => {
  const code = `
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  
  pub fun main(dropID: UInt64, host: Address): &{Drizzle.IDropPublic} {
      let dropCollection =
          getAccount(host)
          .getCapability(Cloud.DropCollectionPublicPath)
          .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")
  
      let dropRef = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow drop")
  
      return dropRef
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(CloudPath, publicConfig.cloudAddress)

  const drop = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(dropID, t.UInt64),
      arg(host, t.Address)
    ]
  }) 

  return drop
}

export const queryBalance = async (token, address) => {
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

export const queryDrops = async (address) => {
  const code = `
  import Drizzle from 0xDrizzle
  import Cloud from 0xCloud
  
  pub fun main(account: Address): {UInt64: &{Drizzle.IDropPublic}} {
      let dropCollection =
          getAccount(account)
          .getCapability(Cloud.DropCollectionPublicPath)
          .borrow<&Cloud.DropCollection{Drizzle.IDropCollectionPublic}>()
  
      if let collection = dropCollection {
          return collection.getAllDrops()
      }
  
      return {}
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(CloudPath, publicConfig.cloudAddress)

  const drops = await fcl.query({
    cadence: code,
    args: (arg, t) => [arg(address, t.Address)]
  }) 

  return drops ?? []
}