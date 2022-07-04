import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import Decimal from 'decimal.js'

const FungibleTokenPath = "0xFungibleToken"
const DrizzlePath = "0xDrizzle"
const DropNPath = "0xDropN"

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

  console.log(code)

  const transactionId = await fcl.mutate({
    cadence: code,
    args: (arg, t) => {
      let args = [
      arg(name, t.String), 
      arg(description, t.String),
      arg(image, t.Optional(t.String)),
      arg(url, t.Optional(t.String)),
      arg(claims, t.Dictionary({key: t.Address, value: t.UFix64})),
      arg(startAt, t.Optional(t.UFix64)),
      arg(endAt, t.Optional(t.UFix64)),
      arg(tokenIssuer, t.Address),
      arg(tokenContractName, t.String),
      arg(tokenProviderPath, t.String),
      arg(tokenBalancePath, t.String),
      arg(tokenReceiverPath, t.String),
      arg(tokenAmount, t.UFix64)
    ]
    console.log(args)
  return args},
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId 
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
  createDropN,
  queryBalance
}

export default drizzleService