import path from "path"
import {
  emulator,
  init,
  getAccountAddress,
} from "flow-js-testing";
import {
  deployCoreContracts,
  deployFLOATContracts,
  deployExampleNFTContracts,
  deployByName,
  getMistAdmin
} from "./src/common";
import { getCollectionType, NFT_getIDs } from "./src/examplenft";
import { createExampleNFTRaffle, mintExampleNFTs } from "./src/mist";

jest.setTimeout(1000000)

const deployContracts = async () => {
  const deployer = await getMistAdmin()
  await deployCoreContracts(deployer)
  await deployFLOATContracts(deployer)
  await deployExampleNFTContracts(deployer)
  await deployByName(deployer, "Distributors")
  await deployByName(deployer, "EligibilityVerifiers")
  await deployByName(deployer, "Mist")
}

describe("Deployment", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "..")
    const port = 8080
    await init(basePath, { port })
    await emulator.start(port)
    return await new Promise(r => setTimeout(r, 2000));
  })

  afterEach(async () => {
    await emulator.stop()
    return await new Promise(r => setTimeout(r, 2000));
  })

  it("Deployment - Should deploy all contracts successfully", async () => {
    const deployer = await getAccountAddress("MistDeployer")
    await deployContracts(deployer)
  })
})

describe("Mist", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "..")
    const port = 8080
    await init(basePath, { port })
    await emulator.start(port)
    await new Promise(r => setTimeout(r, 2000));
    return await deployContracts()
  })

  afterEach(async () => {
    await emulator.stop();
    return await new Promise(r => setTimeout(r, 2000));
  })

  // If the size of whitelist is huge(exceed 30000), it is recommanded to use MerkleAirDrop rather than AirDrop
  // [Error: transaction byte size (3991439) exceeds the maximum byte size allowed for a transaction (3000000)]
  it("Mist - Should be ok if we create raffle with valid params", async () => {
    const Alice = await getAccountAddress("Alice")
    await mintExampleNFTs(Alice)
    const tokenIDs = await NFT_getIDs(Alice)
    console.log(tokenIDs)
    await createExampleNFTRaffle(Alice, { withWhitelist: true, rewardTokenIDs: tokenIDs})

  })
})
