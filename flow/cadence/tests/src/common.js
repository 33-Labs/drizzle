import { 
  getAccountAddress,
  deployContractByName,
  sendTransaction,
  executeScript,
  shallPass,
  shallResolve
} from "flow-js-testing"

export const deployCoreContracts = async (deployer) => {
  const Deployer = deployer || await getAccountAddress("Deployer")
  await deployByName(Deployer, "core/NonFungibleToken")
  await deployByName(Deployer, "core/MetadataViews")
  await deployByName(Deployer, "core/FUSD")
}

export const deployFLOATContracts = async (deployer) => {
  const Deployer = deployer || await getAccountAddress("Deployer")
  await deployByName(Deployer, "float/GrantedAccountAccess")
  await deployByName(Deployer, "float/FLOAT")
  await deployByName(Deployer, "float/FLOATVerifiers")
}

export const deployDrizzleContracts = async (deployer) => {
  const Deployer = deployer || await getAccountAddress("Deployer")
  await deployByName(Deployer, "Drizzle")
  await deployByName(Deployer, "Packets")
  await deployByName(Deployer, "EligibilityReviewers")
  await deployByName(Deployer, "Cloud")
}

export const deployContracts = async (deployer) => {
  await deployCoreContracts(deployer)
  await deployFLOATContracts(deployer)
  await deployDrizzleContracts(deployer)
}

export const deployByName = async (deployer, contractName, args) => {
  const [, error] = await deployContractByName({ to: deployer, name: contractName, args: args })
  expect(error).toBeNull()
}

export const setupFUSDVault = async (account) => {
  const signers = [account]
  const name = "FUSD/setup_fusd_vault"
  await shallPass(sendTransaction({ name: name, signers: signers }))
}

export const mintFUSD = async (minter, amount, recipient) => {
  const signers = [minter]
  const args = [amount, recipient]
  const name = "FUSD/mint_fusd"
  await shallPass(sendTransaction({ name: name, args: args, signers: signers }))
}

export const getFUSDBalance = async (account) => {
  const [result, err] = await shallResolve(executeScript({ name: "FUSD/get_fusd_balance", args: [account] }))
  return parseFloat(result)
}

export const checkFUSDBalance = async (account, expectedBalance) => {
  const balance = await getFUSDBalance(account)
  expect(balance).toBe(expectedBalance)
}