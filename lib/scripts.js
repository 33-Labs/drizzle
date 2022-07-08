import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import Decimal from 'decimal.js'

const FungibleTokenPath = "0xFungibleToken"
const DrizzlePath = "0xDrizzle"
const DropPath = "0xDrop"

export const queryStats = async (dropID, host) => {
  const code = `
  import Drizzle from 0xDrizzle
  import DropN from 0xDrop

  pub struct DropStats {
    pub let dropBalance: UFix64
    pub let claimed: {Address: UFix64}
    pub let tokenSymbol: String

    init(
        dropBalance: UFix64, 
        claimed: {Address: UFix64},
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
          .getCapability(DropN.DropCollectionPublicPath)
          .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")

      let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow drop")

      let claimed = drop.getClaimed()
      let dropBalance = drop.getDropVaultBalance()
      let tokenSymbol = drop.tokenInfo.symbol
      
      return DropStats(dropBalance: dropBalance, claimed: claimed, tokenSymbol: tokenSymbol)
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropPath, publicConfig.dropAddress)

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
  import DropN from 0xDrop

  pub fun main(dropID: UInt64, host: Address): {Address: UFix64} {
      let dropCollection =
          getAccount(host)
          .getCapability(DropN.DropCollectionPublicPath)
          .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")

      let drop = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow drop")
      
      return drop.getClaimed()
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropPath, publicConfig.dropAddress)

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
  import DropN from 0xDrop

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
        if getCurrentBlock().timestamp <= startAt {
            return ClaimStatus(message: "not start", claimable: false, amount: claimableAmount!)    
        }
    }

    if let endAt = drop.endAt {
        if getCurrentBlock().timestamp >= endAt {
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
  .replace(DropPath, publicConfig.dropAddress)

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
  import DropN from 0xDrop

  pub fun main(dropID: UInt64, host: Address): &{Drizzle.IDropPublic} {
      let dropCollection =
          getAccount(host)
          .getCapability(DropN.DropCollectionPublicPath)
          .borrow<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>()
          ?? panic("Could not borrow IDropCollectionPublic from address")

      let dropRef = dropCollection.borrowPublicDropRef(dropID: dropID)
          ?? panic("Could not borrow publicDropRef")

      return dropRef
  }
  `
  .replace(DrizzlePath, publicConfig.drizzleAddress)
  .replace(DropPath, publicConfig.dropAddress)

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
    import DropN from 0xDrop

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
  .replace(DropPath, publicConfig.dropAddress)

  const drops = await fcl.query({
    cadence: code,
    args: (arg, t) => [arg(address, t.Address)]
  }) 

  return drops ?? []
}