import path from "path"
import {
  emulator,
  init,
  getAccountAddress,
} from "flow-js-testing";
import {
  deployCoreContracts,
  deployFLOATContracts,
  deployByName
} from "./src/common";
import { getCollectionType } from "./src/examplenft";

jest.setTimeout(1000000)

const deployContracts = async () => {
  const deployer = await getAccountAddress("MistDeployer")
  await deployCoreContracts(deployer)
  await deployFLOATContracts(deployer)
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
