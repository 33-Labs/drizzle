import path from "path"
import {
  emulator,
  init,
  getAccountAddress,
} from "flow-js-testing";
import {
  checkFUSDBalance,
  deployContracts,
  getFUSDBalance,
} from "./src/common";
import {
  claimDrop,
  depositToDrop,
  withdrawAllFunds,
  togglePause,
  createDefaultFUSDDrop_WhitelistWithAmount,
  getAllDrops,
  getDrop,
  getDropBalance,
  getClaimedRecord,
  getClaimedRecords,
  getClaimStatus,
  getFUSDInfo,
  createDefaultFUSDDrop_FLOATGroup_Identical,
  createDefaultFUSDDrop_FLOATGroup_Random,
  createDefaultFUSDDrop_FLOATs_Identical,
  createDefaultFUSDDrop_FLOATs_Random,
  createDefaultFUSDDrop_Whitelist_Identical,
  createDefaultFUSDDrop_Whitelist_Random,
  createDefaultEvents,
  toggleCloudPause,
  deleteDrop
} from "./src/drizzle";
import {
  FLOAT_claim,
  FLOAT_createEventsWithGroup,
  FLOAT_getEventIDs,
  FLOAT_getEventsInGroup,
  FLOAT_getFLOATIDs
} from "./src/float";

import Decimal from "decimal.js"

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

  it("Common - Should deploy all contracts successfully", async () => {
    await deployContracts()
  })
})

describe("Drop - WhitelistWithAmount", () => {
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
  it("WhitelistWithAmount - Should be ok if we create drop with valid params", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice)
  })

  it("WhitelistWithAmount - Should be ok for whitelisted claimers to claim their reward", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice)

    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(parseFloat(drop.claimedAmount)).toBe(0.0)

    const preClaimed = await getClaimStatus(dropID, Alice, Bob)
    // pub enum ClaimStatusCode: UInt8 {
    //   pub case ok
    //   pub case ineligible
    //   pub case unavailable
    //   pub case claimed
    //   pub case notStartYet
    //   pub case ended
    //   pub case paused
    //   pub case others
    // }
    expect(preClaimed.code.rawValue).toBe(0)
    const eligibleAmount = parseFloat(preClaimed.eligibleAmount)
    expect(eligibleAmount).toBe(100.0)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error).toBeNull()

    await checkFUSDBalance(Bob, eligibleAmount)

    const [, error2] = await claimDrop(dropID, Alice, Bob)
    expect(error2.includes("claimed")).toBeTruthy()

    const dropBalance = parseFloat(await getDropBalance(dropID, Alice))
    expect(dropBalance).toBe(150.0 - eligibleAmount)

    const postClaimed = await getClaimStatus(dropID, Alice, Bob)
    expect(postClaimed.code.rawValue).toBe(3)

    const record = await getClaimedRecord(dropID, Alice, Bob)
    expect(record.address).toBe(Bob)
    expect(parseFloat(record.amount)).toBe(eligibleAmount)

    const records = await getClaimedRecords(dropID, Alice)
    expect(Object.keys(records).length).toBe(1)
    expect(parseFloat(records[Bob].amount)).toBe(eligibleAmount)

    const postDrop = await getDrop(dropID, Alice)
    expect(parseFloat(postDrop.claimedAmount)).toBe(eligibleAmount)
  })

  it("WhitelistWithAmount - Should not be ok for the unwhitelisted accounts to claim the reward", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice)

    const Dave = await getAccountAddress("Dave")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimDrop(dropID, Alice, Dave)
    expect(error.includes("not eligible")).toBeTruthy()
  })
})

describe("DROP - Time Limit", () => {
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

  it("Time Limit - Should not be ok to claim the drop before the drop start", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice, { startAt: (new Date()).getTime() / 1000 + 1000 })

    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error.includes("not start yet")).toBeTruthy()
  })

  it("Time Limit - Should not be ok to claim the drop after the drop end", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice, { endAt: (new Date()).getTime() / 1000 - 1000 })

    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error.includes("ended")).toBeTruthy()
  })

  it("Time Limit - Should be ok to claim the drop within the time window", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice, {
      startAt: (new Date()).getTime() / 1000 - 1000,
      endAt: (new Date()).getTime() / 1000 + 1000
    })

    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error).toBeNull()
  })
})

describe("DROP - Management", () => {
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

  it("Management - DROP should not be created if contract is paused", async () => {
    const Deployer = await getAccountAddress("Deployer")

    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")
    const Carl = await getAccountAddress("Carl")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice)

    await toggleCloudPause(Deployer)
    const error = await createDefaultFUSDDrop_WhitelistWithAmount(Bob, {returnErr: true})
    expect(error.includes("contract is paused")).toBeTruthy()

    await toggleCloudPause(Deployer)
    await createDefaultFUSDDrop_WhitelistWithAmount(Carl)
  })

  it("Management - DROP host should be able to withdraw funds in DROP", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const FUSDInfo = await getFUSDInfo()

    await checkFUSDBalance(Alice, 850.0)

    const preDropBalance = parseFloat(await getDropBalance(dropID, Alice))
    expect(preDropBalance).toBe(150.0)

    const [, error] = await withdrawAllFunds(dropID, Alice, FUSDInfo.tokenIssuer, FUSDInfo.tokenReceiverPath)
    expect(error).toBeNull()

    const postDropBalance = parseFloat(await getDropBalance(dropID, Alice))
    expect(postDropBalance).toBe(0.0)

    await checkFUSDBalance(Alice, 1000.0)
  })

  it("Management - DROP owner should be able to pause and unpause DROP", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice)

    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    await togglePause(dropID, Alice)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error.includes("paused")).toBeTruthy()

    await togglePause(dropID, Alice)

    const [, error2] = await claimDrop(dropID, Alice, Bob)
    expect(error2).toBeNull()
  })

  it("Management - DROP owner should be able to add fund to DROP if the balance is insufficient", async () => {
    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")

    const whitelist = {
      [Bob]: "300.0"
    }

    await createDefaultFUSDDrop_WhitelistWithAmount(Alice, { whitelist: whitelist })

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error.includes("must be less than or equal than")).toBeTruthy()

    const [, error2] = await depositToDrop(dropID, Alice, "300.0")
    expect(error2).toBeNull()

    const [, error3] = await claimDrop(dropID, Alice, Bob)
    expect(error3).toBeNull()
  })

  it("Management - DROP owner should be able to delete DROP and get funds back", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_WhitelistWithAmount(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const FUSDInfo = await getFUSDInfo()

    await checkFUSDBalance(Alice, 850.0)

    const preDropBalance = parseFloat(await getDropBalance(dropID, Alice))
    expect(preDropBalance).toBe(150.0)

    const [, error] = await deleteDrop(dropID, Alice, FUSDInfo.tokenIssuer, FUSDInfo.tokenReceiverPath)
    expect(error).toBeNull()

    const [, error2] = await getDrop(dropID, Alice, false)
    expect(error2.message.includes("Could not borrow drop")).toBeTruthy()

    await checkFUSDBalance(Alice, 1000.0)
  })
})

describe("Drop - Whitelist", () => {
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

  it("Whitelist - Should be ok if we create identical drop with valid params", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_Whitelist_Identical(Alice)
  })
  
  it("Whitelist - Should be ok if we create random drop with valid params", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_Whitelist_Random(Alice)
  })

  it("Whitelist - Should be ok for eligible claimers to claim their reward", async () => {
    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")
    await createDefaultFUSDDrop_Whitelist_Identical(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(parseFloat(drop.claimedAmount)).toBe(0.0)

    const preClaimed = await getClaimStatus(dropID, Alice, Bob)
    // pub enum ClaimStatusCode: UInt8 {
    //   pub case ok
    //   pub case ineligible
    //   pub case unavailable
    //   pub case claimed
    //   pub case notStartYet
    //   pub case ended
    //   pub case paused
    //   pub case others
    // }
    expect(preClaimed.code.rawValue).toBe(0)
    const eligibleAmount = parseFloat(preClaimed.eligibleAmount)
    expect(eligibleAmount).toBe(20.0)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error).toBeNull()

    await checkFUSDBalance(Bob, eligibleAmount)

    const postClaimed = await getClaimStatus(dropID, Alice, Bob)
    expect(postClaimed.code.rawValue).toBe(3)

    const record = await getClaimedRecord(dropID, Alice, Bob)
    expect(record.address).toBe(Bob)
    expect(parseFloat(record.amount)).toBe(eligibleAmount)

    const postDrop = await getDrop(dropID, Alice)
    expect(parseFloat(postDrop.claimedAmount)).toBe(eligibleAmount)
  })

  it("Whitelist - Should not be ok for claimers to claim if they are not eligible", async () => {
    const Alice = await getAccountAddress("Alice")
    const Dave = await getAccountAddress("Dave")
    await createDefaultFUSDDrop_Whitelist_Identical(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, error] = await claimDrop(dropID, Alice, Dave)
    expect(error.includes("not eligible")).toBeTruthy()
  })
})

describe("EC - FLOAT", () => {
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

  it("FLOAT - Should create FLOAT group and events successfully", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    await FLOAT_createEventsWithGroup(FLOATCreator)
  })
})

describe("Drop - FLOATGroup", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "..")
    const port = 8080
    await init(basePath, { port })
    await emulator.start(port)
    await new Promise(r => setTimeout(r, 2000));
    await deployContracts()
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    return await FLOAT_createEventsWithGroup(FLOATCreator)
  })

  afterEach(async () => {
    await emulator.stop();
    return await new Promise(r => setTimeout(r, 2000));
  })

  it("FLOATGroup - Should be ok if we create drop with valid params", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Identical(Alice)
  })

  it("FLOATGroup - Should be ok for eligible claimers to claim their reward", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const events = await FLOAT_getEventsInGroup(FLOATCreator, "GTEST")
    expect(events.length).toBe(3)

    const threshold = 2
    const Bob = await getAccountAddress("Bob")
    for (let i = 0; i < threshold; i++) {
      const event = events[i]
      await FLOAT_claim(Bob, event.eventId, FLOATCreator)
    }
    const floatIDs = await FLOAT_getFLOATIDs(Bob)
    expect(floatIDs.length).toBe(threshold)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Identical(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(parseFloat(drop.claimedAmount)).toBe(0.0)
    expect(threshold).toBe(Object.values(drop.verifiers)[0][0].threshold)

    const preClaimed = await getClaimStatus(dropID, Alice, Bob)
    // pub enum ClaimStatusCode: UInt8 {
    //   pub case ok
    //   pub case ineligible
    //   pub case unavailable
    //   pub case claimed
    //   pub case notStartYet
    //   pub case ended
    //   pub case paused
    //   pub case others
    // }
    expect(preClaimed.code.rawValue).toBe(0)
    const eligibleAmount = parseFloat(preClaimed.eligibleAmount)
    expect(eligibleAmount).toBe(20.0)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error).toBeNull()

    await checkFUSDBalance(Bob, eligibleAmount)

    const postClaimed = await getClaimStatus(dropID, Alice, Bob)
    expect(postClaimed.code.rawValue).toBe(3)

    const record = await getClaimedRecord(dropID, Alice, Bob)
    expect(record.address).toBe(Bob)
    expect(parseFloat(record.amount)).toBe(eligibleAmount)

    const postDrop = await getDrop(dropID, Alice)
    expect(parseFloat(postDrop.claimedAmount)).toBe(eligibleAmount)
  })

  it("FLOATGroup - Should not be ok for claimers to claim if they are not meet the threshold", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const events = await FLOAT_getEventsInGroup(FLOATCreator, "GTEST")
    expect(events.length).toBe(3)

    const Bob = await getAccountAddress("Bob")
    await FLOAT_claim(Bob, events[0].eventId, FLOATCreator)

    const floatIDs = await FLOAT_getFLOATIDs(Bob)
    expect(floatIDs.length).toBe(1)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Identical(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(Object.values(drop.verifiers)[0][0].threshold).toBe(2)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error.includes("not eligible")).toBeTruthy()
  })

  it("FLOATGroup - Should not be ok for claimers to claim if they reach the threshold after the creation of DROP", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Identical(Alice)
    await new Promise(r => setTimeout(r, 2000));

    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    const threshold = Object.values(drop.verifiers)[0][0].threshold
    expect(threshold).toBe(2)

    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const events = await FLOAT_getEventsInGroup(FLOATCreator, "GTEST")
    expect(events.length).toBe(3)

    for (let i = 0; i < threshold; i++) {
      const event = events[i]
      await FLOAT_claim(Bob, event.eventId, FLOATCreator)
    }

    const floatIDs = await FLOAT_getFLOATIDs(Bob)
    expect(floatIDs.length).toBe(threshold)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error.includes("not eligible")).toBeTruthy()
  })
})

describe("Drop - FLOATs", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "..")
    const port = 8080
    await init(basePath, { port })
    await emulator.start(port)
    await new Promise(r => setTimeout(r, 2000));
    await deployContracts()
    const creator = await getAccountAddress("FLOATCreator")
    return await createDefaultEvents(creator)
  })

  afterEach(async () => {
    await emulator.stop();
    return await new Promise(r => setTimeout(r, 2000));
  })

  it("FLOATs - Should be ok if we create identical drop with valid params", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATs_Identical(Alice)
  })

  it("FLOATs - Should be ok if we create random drop with valid params", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATs_Random(Alice)
  })

  it("FLOATs - Should be ok for eligible claimers to claim their reward", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const eventIDs = await FLOAT_getEventIDs(FLOATCreator)
    expect(eventIDs.length).toBe(3)

    const threshold = 2
    const Bob = await getAccountAddress("Bob")
    for (let i = 0; i < threshold; i++) {
      const eventID = eventIDs[i]
      await FLOAT_claim(Bob, eventID, FLOATCreator)
    }
    const floatIDs = await FLOAT_getFLOATIDs(Bob)
    expect(floatIDs.length).toBe(threshold)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATs_Identical(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(parseFloat(drop.claimedAmount)).toBe(0.0)
    expect(threshold).toBe(Object.values(drop.verifiers)[0][0].threshold)

    const preClaimed = await getClaimStatus(dropID, Alice, Bob)
    // pub enum ClaimStatusCode: UInt8 {
    //   pub case ok
    //   pub case ineligible
    //   pub case unavailable
    //   pub case claimed
    //   pub case notStartYet
    //   pub case ended
    //   pub case paused
    //   pub case others
    // }
    expect(preClaimed.code.rawValue).toBe(0)
    const eligibleAmount = parseFloat(preClaimed.eligibleAmount)
    expect(eligibleAmount).toBe(20.0)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error).toBeNull()

    await checkFUSDBalance(Bob, eligibleAmount)

    const postClaimed = await getClaimStatus(dropID, Alice, Bob)
    expect(postClaimed.code.rawValue).toBe(3)

    const record = await getClaimedRecord(dropID, Alice, Bob)
    expect(record.address).toBe(Bob)
    expect(parseFloat(record.amount)).toBe(eligibleAmount)

    const postDrop = await getDrop(dropID, Alice)
    expect(parseFloat(postDrop.claimedAmount)).toBe(eligibleAmount)
  })

  it("FLOATs - Should not be ok for claimers to claim if they are not meet the threshold", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const eventIDs = await FLOAT_getEventIDs(FLOATCreator)
    expect(eventIDs.length).toBe(3)

    const Bob = await getAccountAddress("Bob")
    await FLOAT_claim(Bob, eventIDs[0], FLOATCreator)

    const floatIDs = await FLOAT_getFLOATIDs(Bob)
    expect(floatIDs.length).toBe(1)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATs_Identical(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(Object.values(drop.verifiers)[0][0].threshold).toBe(2)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error.includes("not eligible")).toBeTruthy()
  })

  it("FLOATs - Should not be ok for claimers to claim if they reach the threshold after the creation of DROP", async () => {
    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATs_Identical(Alice)
    await new Promise(r => setTimeout(r, 2000));

    const Bob = await getAccountAddress("Bob")

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    const threshold = Object.values(drop.verifiers)[0][0].threshold
    expect(threshold).toBe(2)

    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const eventIDs = await FLOAT_getEventIDs(FLOATCreator)
    expect(eventIDs.length).toBe(3)

    for (let i = 0; i < threshold; i++) {
      await FLOAT_claim(Bob, eventIDs[i], FLOATCreator)
    }

    const floatIDs = await FLOAT_getFLOATIDs(Bob)
    expect(floatIDs.length).toBe(threshold)

    const [, error] = await claimDrop(dropID, Alice, Bob)
    expect(error.includes("not eligible")).toBeTruthy()
  })
})

describe("Drop - Identical Packet", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "..")
    const port = 8080
    await init(basePath, { port })
    await emulator.start(port)
    await new Promise(r => setTimeout(r, 2000));
    await deployContracts()
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    return await FLOAT_createEventsWithGroup(FLOATCreator)
  })

  afterEach(async () => {
    await emulator.stop();
    return await new Promise(r => setTimeout(r, 2000));
  })

  it("Identical Packet - All the claimer's reward should be the same", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const events = await FLOAT_getEventsInGroup(FLOATCreator, "GTEST")
    expect(events.length).toBe(3)

    const threshold = 2
    const Bob = await getAccountAddress("Bob")
    const Carl = await getAccountAddress("Carl")
    const Dave = await getAccountAddress("Dave")
    for (let i = 0; i < threshold; i++) {
      const event = events[i]
      await FLOAT_claim(Bob, event.eventId, FLOATCreator)
      await FLOAT_claim(Carl, event.eventId, FLOATCreator)
      await FLOAT_claim(Dave, event.eventId, FLOATCreator)
    }

    const floatIDsOfBob = await FLOAT_getFLOATIDs(Bob)
    const floatIDsOfCarl = await FLOAT_getFLOATIDs(Carl)
    const floatIDsOfDave = await FLOAT_getFLOATIDs(Dave)
    expect(floatIDsOfBob.length).toBe(threshold)
    expect(floatIDsOfCarl.length).toBe(threshold)
    expect(floatIDsOfDave.length).toBe(threshold)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Identical(Alice, { capacity: 3 })

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const preClaimedBob = await getClaimStatus(dropID, Alice, Bob)
    expect(preClaimedBob.code.rawValue).toBe(0)
    const eligibleAmountBob = parseFloat(preClaimedBob.eligibleAmount)
    expect(eligibleAmountBob).toBe(20.0)

    const preClaimedCarl = await getClaimStatus(dropID, Alice, Carl)
    expect(preClaimedCarl.code.rawValue).toBe(0)
    const eligibleAmountCarl = parseFloat(preClaimedCarl.eligibleAmount)
    expect(eligibleAmountCarl).toBe(eligibleAmountBob)

    const preClaimedDave = await getClaimStatus(dropID, Alice, Dave)
    expect(preClaimedDave.code.rawValue).toBe(0)
    const eligibleAmountDave = parseFloat(preClaimedDave.eligibleAmount)
    expect(eligibleAmountDave).toBe(eligibleAmountBob)

    const [, errorBob] = await claimDrop(dropID, Alice, Bob)
    expect(errorBob).toBeNull()
    const [, errorCarl] = await claimDrop(dropID, Alice, Carl)
    expect(errorCarl).toBeNull()
    const [, errorDave] = await claimDrop(dropID, Alice, Dave)
    expect(errorDave).toBeNull()

    await checkFUSDBalance(Bob, eligibleAmountBob)
    await checkFUSDBalance(Carl, eligibleAmountCarl)
    await checkFUSDBalance(Dave, eligibleAmountDave)
  })

  it("Identical Packet - Should not be ok for claimers to claim if the DROP run out of capacity", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const events = await FLOAT_getEventsInGroup(FLOATCreator, "GTEST")
    expect(events.length).toBe(3)

    const threshold = 2
    const Bob = await getAccountAddress("Bob")
    const Carl = await getAccountAddress("Carl")
    const Dave = await getAccountAddress("Dave")
    for (let i = 0; i < threshold; i++) {
      const event = events[i]
      await FLOAT_claim(Bob, event.eventId, FLOATCreator)
      await FLOAT_claim(Carl, event.eventId, FLOATCreator)
      await FLOAT_claim(Dave, event.eventId, FLOATCreator)
    }

    const floatIDsOfBob = await FLOAT_getFLOATIDs(Bob)
    const floatIDsOfCarl = await FLOAT_getFLOATIDs(Carl)
    const floatIDsOfDave = await FLOAT_getFLOATIDs(Dave)
    expect(floatIDsOfBob.length).toBe(threshold)
    expect(floatIDsOfCarl.length).toBe(threshold)
    expect(floatIDsOfDave.length).toBe(threshold)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Identical(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(Object.values(drop.verifiers)[0][0].threshold).toBe(threshold)

    const [, errorBob] = await claimDrop(dropID, Alice, Bob)
    expect(errorBob).toBeNull()

    const [, errorCarl] = await claimDrop(dropID, Alice, Carl)
    expect(errorCarl).toBeNull()

    const [result, errorDave] = await claimDrop(dropID, Alice, Dave)
    expect(errorDave.includes("no longer available")).toBeTruthy()
  })
})

describe("Drop - Random Packet", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "..")
    const port = 8080
    await init(basePath, { port })
    await emulator.start(port)
    await new Promise(r => setTimeout(r, 2000));
    await deployContracts()
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    return await FLOAT_createEventsWithGroup(FLOATCreator)
  })

  afterEach(async () => {
    await emulator.stop();
    return await new Promise(r => setTimeout(r, 2000));
  })

  it("Random Packet - Claimer's reward should be random", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const events = await FLOAT_getEventsInGroup(FLOATCreator, "GTEST")
    expect(events.length).toBe(3)

    const threshold = 2
    const Bob = await getAccountAddress("Bob")
    const Carl = await getAccountAddress("Carl")
    const Dave = await getAccountAddress("Dave")
    for (let i = 0; i < threshold; i++) {
      const event = events[i]
      await FLOAT_claim(Bob, event.eventId, FLOATCreator)
      await FLOAT_claim(Carl, event.eventId, FLOATCreator)
      await FLOAT_claim(Dave, event.eventId, FLOATCreator)
    }

    const floatIDsOfBob = await FLOAT_getFLOATIDs(Bob)
    const floatIDsOfCarl = await FLOAT_getFLOATIDs(Carl)
    const floatIDsOfDave = await FLOAT_getFLOATIDs(Dave)
    expect(floatIDsOfBob.length).toBe(threshold)
    expect(floatIDsOfCarl.length).toBe(threshold)
    expect(floatIDsOfDave.length).toBe(threshold)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Random(Alice, { capacity: 3 })

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const [, errorBob] = await claimDrop(dropID, Alice, Bob)
    expect(errorBob).toBeNull()
    const [, errorCarl] = await claimDrop(dropID, Alice, Carl)
    expect(errorCarl).toBeNull()
    const [, errorDave] = await claimDrop(dropID, Alice, Dave)
    expect(errorDave).toBeNull()

    const balanceBob = new Decimal(await getFUSDBalance(Bob))
    const balanceCarl = new Decimal(await getFUSDBalance(Carl))
    const balanceDave = new Decimal(await getFUSDBalance(Dave))

    // NOTE: There is a very small chance that the balances are equal
    expect(balanceBob.cmp(balanceCarl)).not.toBe(0)
    expect(balanceCarl.cmp(balanceDave)).not.toBe(0)
    expect(balanceDave.cmp(balanceBob)).not.toBe(0)

    const sum = balanceBob.add(balanceCarl).add(balanceDave)
    expect(sum.cmp(new Decimal(150.0))).toBe(0)
  })

  it("Random Packet - Should not be ok for claimers to claim if the DROP run out of capacity", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const events = await FLOAT_getEventsInGroup(FLOATCreator, "GTEST")
    expect(events.length).toBe(3)

    const threshold = 2
    const Bob = await getAccountAddress("Bob")
    const Carl = await getAccountAddress("Carl")
    const Dave = await getAccountAddress("Dave")
    for (let i = 0; i < threshold; i++) {
      const event = events[i]
      await FLOAT_claim(Bob, event.eventId, FLOATCreator)
      await FLOAT_claim(Carl, event.eventId, FLOATCreator)
      await FLOAT_claim(Dave, event.eventId, FLOATCreator)
    }

    const floatIDsOfBob = await FLOAT_getFLOATIDs(Bob)
    const floatIDsOfCarl = await FLOAT_getFLOATIDs(Carl)
    const floatIDsOfDave = await FLOAT_getFLOATIDs(Dave)
    expect(floatIDsOfBob.length).toBe(threshold)
    expect(floatIDsOfCarl.length).toBe(threshold)
    expect(floatIDsOfDave.length).toBe(threshold)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Random(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(Object.values(drop.verifiers)[0][0].threshold).toBe(threshold)

    const [, errorBob] = await claimDrop(dropID, Alice, Bob)
    expect(errorBob).toBeNull()

    const [, errorCarl] = await claimDrop(dropID, Alice, Carl)
    expect(errorCarl).toBeNull()

    const [, errorDave] = await claimDrop(dropID, Alice, Dave)
    expect(errorDave.includes("no longer available")).toBeTruthy()
  })

  it("Random Packet - Should have note in ClaimStatus", async () => {
    const FLOATCreator = await getAccountAddress("FLOATCreator")
    // We have 3 events by default, and we need 2 of them to be eligible
    const events = await FLOAT_getEventsInGroup(FLOATCreator, "GTEST")
    expect(events.length).toBe(3)

    const threshold = 2
    const Bob = await getAccountAddress("Bob")
    for (let i = 0; i < threshold; i++) {
      const event = events[i]
      await FLOAT_claim(Bob, event.eventId, FLOATCreator)
    }

    const floatIDsOfBob = await FLOAT_getFLOATIDs(Bob)
    expect(floatIDsOfBob.length).toBe(threshold)

    const Alice = await getAccountAddress("Alice")
    await createDefaultFUSDDrop_FLOATGroup_Random(Alice)

    const drops = await getAllDrops(Alice)
    const dropID = parseInt(Object.keys(drops)[0])

    const drop = await getDrop(dropID, Alice)
    expect(Object.values(drop.verifiers)[0][0].threshold).toBe(threshold)

    const claimStatus = await getClaimStatus(dropID, Alice, Bob)
    expect(claimStatus.extraData.note.includes("for RandomPacket")).toBeTruthy()
  })
})
