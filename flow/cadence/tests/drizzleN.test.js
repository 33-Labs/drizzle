import path from "path"
import {
  emulator,
  init,
  shallPass,
  getAccountAddress,
  mintFlow,
  getFlowBalance,
  deployContractByName,
  sendTransaction,
  executeScript,
  shallResolve
} from "flow-js-testing";

jest.setTimeout(1000000)

describe("DropN", () => {
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


  it("Should be ok if we create airdrop with valid params", async () => {
    await deployContracts()
    await createValidAirdrop()
  })

  // If the size of claims is huge(exceed 30000), it is recommanded to use MerkleAirDrop rather than AirDrop
  // [Error: transaction byte size (3991439) exceeds the maximum byte size allowed for a transaction (3000000)]
  it("Should be ok if we create airdrop with large claims", async () => {
    let claims = {}
    const zeroPad = (num, places) => String(num).padStart(places, '0')
    for (let i = 0; i < 30000; i++) {
      const account = `0x${zeroPad(i, 16)}`
      claims[account] = `${i + 1}.0`
    }
    await deployContracts()
    await createValidAirdrop(claims)
  })

  it("Should be ok for claimers to claim their reward", async () => {
    await deployContracts()
    await createValidAirdrop()

    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const preClaimed = await hasClaimedDrop(dropID, Alice, Bob)
    expect(preClaimed).toBeNull()

    const claimAmount = parseFloat(await getClaimableAmount(dropID, Alice, Bob))
    expect(claimAmount).toBe(100.0)

    const [, error] = await claimAirdrop(dropID, Alice, Bob)
    expect(error).toBeNull()

    await checkFUSDBalance(Bob, claimAmount)

    const [, error2] = await claimAirdrop(dropID, Alice, Bob)
    expect(error2.includes("claimed")).toBeTruthy()

    const dropVaultBalance = parseFloat(await getDropVaultBalance(dropID, Alice))
    expect(dropVaultBalance).toBe(150.0 - claimAmount)

    const postClaimed = parseFloat(await hasClaimedDrop(dropID, Alice, Bob))
    expect(postClaimed).toBe(claimAmount)

    const claimed = await getClaimed(dropID, Alice)
    expect(Object.keys(claimed).length).toBe(1)
    expect(parseFloat(claimed[Bob])).toBe(postClaimed)
  })

  it("Should not be ok for claimers to claim their reward before the drop start", async () => {
    await deployContracts()
    await createValidAirdrop(null, (new Date()).getTime() / 1000 + 1000, null)

    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimAirdrop(dropID, Alice, Bob)
    expect(error.includes("not start yet")).toBeTruthy()
  })

  it("Should not be ok for claimers to claim their reward after the drop end", async () => {
    await deployContracts()
    await createValidAirdrop(null, null, (new Date()).getTime() / 1000 - 1000)

    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimAirdrop(dropID, Alice, Bob)
    expect(error.includes("already ended")).toBeTruthy()
  })

  it("Should be ok for claimers to claim their reward within the time window", async () => {
    await deployContracts()
    await createValidAirdrop(null, (new Date().getTime() / 1000 - 1000), (new Date()).getTime() / 1000 + 1000)

    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimAirdrop(dropID, Alice, Bob)
    expect(error).toBeNull()
  })

  it("DROP owner should be able to withdraw funds in DROP", async () => {
    await deployContracts()
    await createValidAirdrop()

    const Alice = await getAccountAddress("Alice")
    const Dave = await getAccountAddress("Dave")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const tokenIssuer = Alice
    const tokenReceiverPath = "fusdReceiver"

    await checkFUSDBalance(Alice, 850.0) 

    const preDropBalance = parseFloat(await getDropVaultBalance(dropID, Alice))
    expect(preDropBalance).toBe(150.0) 

    const [, error] = await withdrawFunds(dropID, Alice, tokenIssuer, tokenReceiverPath)
    expect(error).toBeNull()

    const postDropBalance = parseFloat(await getDropVaultBalance(dropID, Alice))
    expect(postDropBalance).toBe(0) 

    await checkFUSDBalance(Alice, 1000.0) 
  })

  it("DROP owner should be able to add claims", async () => {
    await deployContracts()
    await createValidAirdrop()

    const Alice = await getAccountAddress("Alice")
    const Dave = await getAccountAddress("Dave")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const newClaims = {
      [Dave]: "10.0"
    }

    const [, error] = await addClaims(dropID, Alice, newClaims)
    expect(error).toBeNull()

    const [, error2] = await claimAirdrop(dropID, Alice, Dave)
    expect(error2).toBeNull()
  })

  it("DROP owner should be able to toggle claimable", async () => {
    await deployContracts()
    await createValidAirdrop()

    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    await toggleClaimable(dropID, Alice)
    const preClaimable = await getClaimable(dropID, Alice)
    expect(preClaimable).toBeFalsy()

    const [, error] = await claimAirdrop(dropID, Alice, Bob)
    expect(error.includes("not claimable")).toBeTruthy()

    await toggleClaimable(dropID, Alice)
    const postClaimable = await getClaimable(dropID, Alice)
    expect(postClaimable).toBeTruthy()

    const [, error2] = await claimAirdrop(dropID, Alice, Bob)
    expect(error2).toBeNull()
  })

  it("DROP owner should be able to add fund to DROP if the balance is insufficient", async () => {
    const Bob = await getAccountAddress("Alice")

    const claims = {
      [Bob]: "300.0"
    }

    await deployContracts()
    await createValidAirdrop(claims)

    const Alice = await getAccountAddress("Alice")
    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimAirdrop(dropID, Alice, Bob)
    expect(error.includes("must be less than or equal than")).toBeTruthy()

    const [, error2] = await depositToAirdrop(dropID, Alice, "300.0")
    expect(error2).toBeNull()

    const [, error3] = await claimAirdrop(dropID, Alice, Bob)
    expect(error3).toBeNull()
  })
})

async function createValidAirdrop(_claims, _startAt, _endAt) {
  const Alice = await getAccountAddress("Alice")
  await setupFUSDVault(Alice)
  await mintFlow(Alice, 100.0)

  const fusdAmount = 1000.0
  await mintFUSD(Alice, fusdAmount, Alice)
  await checkFUSDBalance(Alice, fusdAmount)

  const Bob = await getAccountAddress("Bob")
  const Carl = await getAccountAddress("Carl")

  const claims = _claims ?? {
    [Bob]: "100.0",
    [Carl]: "50.0"
  }

  const startAt = _startAt ?? null
  const endAt = _endAt ?? null

  const dropName = "TEST"
  const description = "Hello World"
  const image = null
  const url = null
  const tokenIssuer = Alice
  const tokenContractName = "FUSD"
  const tokenSymbol = "FUSD"
  const tokenProviderPath = "fusdVault"
  const tokenBalancePath = "fusdBalance"
  const tokenReceiverPath = "fusdReceiver"
  const tokenAmount = 150.0

  const args = [
    dropName, description, image, url, claims, startAt, endAt,
    tokenIssuer, tokenContractName, tokenSymbol, tokenProviderPath,
    tokenBalancePath, tokenReceiverPath, tokenAmount
  ]

  await createAirdrop(Alice, args)
  await checkFUSDBalance(Alice, fusdAmount - tokenAmount)
}

// Helpers

async function deployContracts() {
  const Alice = await getAccountAddress("Alice")
  await deploy(Alice, "Drizzle")
  await deploy(Alice, "DropN")
  await deploy(Alice, "FUSD")
}

async function deploy(deployer, contractName) {
  const [, error] = await deployContractByName({ to: deployer, name: contractName })
  expect(error).toBeNull()
}

async function setupFUSDVault(account) {
  const signers = [account]
  const name = "setup_fusd_vault"
  await shallPass(sendTransaction({ name: name, signers: signers }))
}

async function mintFUSD(minter, amount, recipient) {
  const signers = [minter]
  const args = [amount, recipient]
  const name = "mint_fusd"
  await shallPass(sendTransaction({ name: name, args: args, signers: signers }))
}

async function getFUSDBalance(account) {
  const [result, err] = await shallResolve(executeScript({ name: "get_fusd_balance", args: [account] }))
  return parseFloat(result)
}

async function checkFUSDBalance(account, expectedBalance) {
  const balance = await getFUSDBalance(account)
  expect(balance).toBe(expectedBalance)
}

// AirDrop

// ---- transactions ----

async function createAirdrop(host, args) {
  const signers = [host]
  const name = "create_airdrop"
  const [tx, error] = await sendTransaction({ name: name, signers: signers, args: args })
  expect(error).toBeNull()
}

async function claimAirdrop(dropID, host, claimer) {
  const signers = [claimer]
  const name = "claim_airdrop"
  const args = [dropID, host]
  return await sendTransaction({ name: name, signers: signers, args: args })
}

async function depositToAirdrop(dropID, host, amount) {
  const signers = [host]
  const name = "deposit_to_airdrop"
  const args = [dropID, amount]
  return await sendTransaction({ name: name, signers: signers, args: args })
}

async function toggleClaimable(dropID, host) {
  const signers = [host]
  const name = "toggle_claimable"
  const args = [dropID]
  return await sendTransaction({ name: name, signers: signers, args: args })
}

async function addClaims(dropID, host, newClaims) {
  const signers = [host]
  const name = "add_claims"
  const args = [dropID, newClaims]
  return await sendTransaction({ name: name, signers: signers, args: args })
}

async function withdrawFunds(dropID, host, tokenIssuer, tokenReceiverPath) {
  const signers = [host]
  const name = "withdraw_funds"
  const args = [dropID, tokenIssuer, tokenReceiverPath]
  return await sendTransaction({ name: name, signers: signers, args: args})
}

// ---- scripts ----

async function getAllDrops(targetAccount) {
  const name = "get_all_drops"
  const args = [targetAccount]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

async function getClaimableAmount(dropID, host, claimer) {
  const name = "get_claim_amount"
  const args = [dropID, host, claimer]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

async function getDropVaultBalance(dropID, host) {
  const name = "get_drop_vault_balance"
  const args = [dropID, host]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

async function hasClaimedDrop(dropID, host, claimer) {
  const name = "has_claimed_drop"
  const args = [dropID, host, claimer]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

async function getClaimed(dropID, host) {
  const name = "get_claimed"
  const args = [dropID, host]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

async function getClaimable(dropID, host) {
  const name = "get_claimable"
  const args = [dropID, host]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

