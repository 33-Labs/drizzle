import path from "path"
import {
  emulator,
  init,
  getAccountAddress,
} from "flow-js-testing";
import {
  deployCoreContracts,
  deployNFTCatalogContracts,
} from "./src/common";
import { getCollectionType } from "./src/NFTCatalog";

jest.setTimeout(1000000)

describe("Common", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "..")
    const port = 8080
    await init(basePath, { port })
    await emulator.start(port)
    return await new Promise(r => setTimeout(r, 2000));
  })

  afterEach(async () => {
    await emulator.stop();
    return await new Promise(r => setTimeout(r, 2000));
  })

  it("Fog - Should deploy all contracts successfully", async () => {
    await deployCoreContracts()
    await deployNFTCatalogContracts()
    const type = await getCollectionType()
    console.log(type)
  })
})
