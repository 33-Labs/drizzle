import { 
  getAccountAddress,
  mintFlow,
  sendTransaction,
  executeScript
} from "flow-js-testing"
import { 
  checkFUSDBalance,
  mintFUSD,
  setupFUSDVault 
} from "./common"
import { 
  FLOAT_getEventIDs,
  FLOAT_createEvent
} from "./float"

// ===== WHITELIST_WITH_AMOUNT =====

export const createDrop_WhitelistWithAmount = async (signer, params) => {
  const signers = [signer]
  const txName = "create_drop_whitelist_with_amount"
  return await sendTransaction({ name: txName, signers: signers, args: params})
}

export const createFUSDDrop_WhitelistWithAmount = async (signer, params) => {
  const {
    initFlowAmount, 
    initFUSDAmount,
    name, description, image, url,
    startAt, endAt,
    FUSDInfo,
    whitelist, tokenAmount
  } = params
  if (tokenAmount > initFUSDAmount) throw "tokenAmount shoud less than initFUSDAmount"

  await mintFlow(signer, initFlowAmount)
  await setupFUSDVault(signer)

  await mintFUSD(await getAccountAddress("Deployer"), initFUSDAmount, signer)
  await checkFUSDBalance(signer, initFUSDAmount)

  const args = [
    name, description, image, url,
    startAt, endAt,
    FUSDInfo.tokenIssuer, FUSDInfo.tokenContractName, FUSDInfo.tokenSymbol,
    FUSDInfo.tokenProviderPath, FUSDInfo.tokenBalancePath, FUSDInfo.tokenReceiverPath,
    whitelist, tokenAmount 
  ]
  return await createDrop_WhitelistWithAmount(signer, args)
}

export const createDefaultFUSDDrop_WhitelistWithAmount = async (signer, overrides = {}) => {
  const defaultWhitelist = await getDefaultWhitelist()
  const FUSDInfo = await getFUSDInfo()

  const {whitelist, image, url, startAt, endAt, returnErr} = overrides
  const args = {
    initFlowAmount: 100.0, 
    initFUSDAmount: 1000.0,
    name: "TEST", 
    description: "Test DROP", 
    image: image || null, url: url || null,
    startAt: startAt || null, endAt: endAt || null,
    FUSDInfo: FUSDInfo,
    whitelist: whitelist || defaultWhitelist, tokenAmount: 150.0
  }
  const [tx, error] = await createFUSDDrop_WhitelistWithAmount(signer, args)
  if (returnErr === true) {
    return error
  }
  expect(error).toBeNull()
}

// ===== FLOATS_IDENTICAL =====

export const createDrop_FLOATs_Identical = async (signer, params) => {
  const signers = [signer]
  const txName = "create_drop_floats_identical"
  return await sendTransaction({ name: txName, signers: signers, args: params})
}

export const createFUSDDrop_FLOATs_Identical = async (signer, params) => {
  const {
    initFlowAmount, 
    initFUSDAmount,
    name, description, image, url,
    startAt, endAt,
    FUSDInfo,
    eventIDs, eventHosts, capacity, amountPerPacket, threshold,
    tokenAmount
  } = params
  if (tokenAmount > initFUSDAmount) throw "tokenAmount shoud less than initFUSDAmount"

  await mintFlow(signer, initFlowAmount)
  await setupFUSDVault(signer)

  await mintFUSD(await getAccountAddress("Deployer"), initFUSDAmount, signer)
  await checkFUSDBalance(signer, initFUSDAmount)

  const args = [
    name, description, image, url,
    startAt, endAt,
    FUSDInfo.tokenIssuer, FUSDInfo.tokenContractName, FUSDInfo.tokenSymbol,
    FUSDInfo.tokenProviderPath, FUSDInfo.tokenBalancePath, FUSDInfo.tokenReceiverPath,
    eventIDs, eventHosts, capacity, amountPerPacket, threshold, 
    tokenAmount 
  ]
  return await createDrop_FLOATs_Identical(signer, args)
}

export const createDefaultFUSDDrop_FLOATs_Identical = async (signer, overrides = {}) => {
  const FUSDInfo = await getFUSDInfo()
  const creator = await getAccountAddress("FLOATCreator")
  const defaultEventIDs = await FLOAT_getEventIDs(creator)
  expect(defaultEventIDs.length).toBe(3)
  const defaultEventHosts = [creator, creator, creator]

  const {eventIDs, eventHosts, image, url, startAt, endAt, capacity, amountPerPacket, threshold} = overrides
  const args = {
    initFlowAmount: 100.0, 
    initFUSDAmount: 1000.0,
    name: "TEST", 
    description: "Test DROP", 
    image: image || null, url: url || null,
    startAt: startAt || null, endAt: endAt || null,
    FUSDInfo: FUSDInfo,
    eventIDs: eventIDs || defaultEventIDs,
    eventHosts: eventHosts || defaultEventHosts,
    capacity: capacity || 2,
    amountPerPacket: amountPerPacket || 20.0,
    threshold: threshold || 2,
    tokenAmount: 150.0
  }

  const [tx, error] = await createFUSDDrop_FLOATs_Identical(signer, args)
  expect(error).toBeNull()
}

// ===== FLOATs RANDOME =====

export const createDrop_FLOATs_Random = async (signer, params) => {
  const signers = [signer]
  const txName = "create_drop_floats_random"
  return await sendTransaction({ name: txName, signers: signers, args: params})
}

export const createFUSDDrop_FLOATs_Random = async (signer, params) => {
  const {
    initFlowAmount, 
    initFUSDAmount,
    name, description, image, url,
    startAt, endAt,
    FUSDInfo,
    eventIDs, eventHosts, capacity, threshold,
    tokenAmount
  } = params
  if (tokenAmount > initFUSDAmount) throw "tokenAmount shoud less than initFUSDAmount"

  await mintFlow(signer, initFlowAmount)
  await setupFUSDVault(signer)

  await mintFUSD(await getAccountAddress("Deployer"), initFUSDAmount, signer)
  await checkFUSDBalance(signer, initFUSDAmount)

  const args = [
    name, description, image, url,
    startAt, endAt,
    FUSDInfo.tokenIssuer, FUSDInfo.tokenContractName, FUSDInfo.tokenSymbol,
    FUSDInfo.tokenProviderPath, FUSDInfo.tokenBalancePath, FUSDInfo.tokenReceiverPath,
    eventIDs, eventHosts, capacity, threshold, 
    tokenAmount 
  ]
  return await createDrop_FLOATs_Random(signer, args)
}

export const createDefaultFUSDDrop_FLOATs_Random = async (signer, overrides = {}) => {
  const FUSDInfo = await getFUSDInfo()
  const creator = await getAccountAddress("FLOATCreator")
  const defaultEventIDs = await FLOAT_getEventIDs(creator)
  expect(defaultEventIDs.length).toBe(3)
  const defaultEventHosts = [creator, creator, creator]

  const {eventIDs, eventHosts, image, url, startAt, endAt, capacity, threshold} = overrides
  const args = {
    initFlowAmount: 100.0, 
    initFUSDAmount: 1000.0,
    name: "TEST", 
    description: "Test DROP", 
    image: image || null, url: url || null,
    startAt: startAt || null, endAt: endAt || null,
    FUSDInfo: FUSDInfo,
    eventIDs: eventIDs || defaultEventIDs,
    eventHosts: eventHosts || defaultEventHosts,
    capacity: capacity || 2,
    threshold: threshold || 2,
    tokenAmount: 150.0
  }

  const [tx, error] = await createFUSDDrop_FLOATs_Random(signer, args)
  expect(error).toBeNull()
}

// ===== FLOAT_GROUP_IDENTICAL =====

export const createDrop_FLOATGroup_Identical = async (signer, params) => {
  const signers = [signer]
  const txName = "create_drop_float_group_identical"
  return await sendTransaction({ name: txName, signers: signers, args: params}) 
}

export const createFUSDDrop_FLOATGroup_Identical = async (signer, params) => {
  const {
    initFlowAmount, 
    initFUSDAmount,
    name, description, image, url,
    startAt, endAt,
    FUSDInfo,
    floatGroupName, floatGroupHost, capacity, amountPerPacket, threshold,
    tokenAmount
  } = params
  if (tokenAmount > initFUSDAmount) throw "tokenAmount shoud less than initFUSDAmount"

  await mintFlow(signer, initFlowAmount)
  await setupFUSDVault(signer)

  await mintFUSD(await getAccountAddress("Deployer"), initFUSDAmount, signer)
  await checkFUSDBalance(signer, initFUSDAmount)

  const args = [
    name, description, image, url,
    startAt, endAt,
    FUSDInfo.tokenIssuer, FUSDInfo.tokenContractName, FUSDInfo.tokenSymbol,
    FUSDInfo.tokenProviderPath, FUSDInfo.tokenBalancePath, FUSDInfo.tokenReceiverPath,
    floatGroupName, floatGroupHost, capacity, amountPerPacket, threshold, 
    tokenAmount 
  ]
  return await createDrop_FLOATGroup_Identical(signer, args)
}

export const createDefaultFUSDDrop_FLOATGroup_Identical = async (signer, overrides = {}) => {
  const FUSDInfo = await getFUSDInfo()

  const {groupName, image, url, startAt, endAt, capacity, amountPerPacket, threshold} = overrides
  const args = {
    initFlowAmount: 100.0, 
    initFUSDAmount: 1000.0,
    name: "TEST", 
    description: "Test DROP", 
    image: image || null, url: url || null,
    startAt: startAt || null, endAt: endAt || null,
    FUSDInfo: FUSDInfo,
    floatGroupName: groupName || "GTEST",
    floatGroupHost: await getAccountAddress("FLOATCreator"),
    capacity: capacity || 2,
    amountPerPacket: amountPerPacket || 20.0,
    threshold: threshold || 2,
    tokenAmount: 150.0
  }

  const [tx, error] = await createFUSDDrop_FLOATGroup_Identical(signer, args)
  expect(error).toBeNull()
}

// ===== FLOAT_GROUP_RANDOM =====

export const createDrop_FLOATGroup_Random = async (signer, params) => {
  const signers = [signer]
  const txName = "create_drop_float_group_random"
  return await sendTransaction({ name: txName, signers: signers, args: params}) 
}

export const createFUSDDrop_FLOATGroup_Random = async (signer, params) => {
  const {
    initFlowAmount, 
    initFUSDAmount,
    name, description, image, url,
    startAt, endAt,
    FUSDInfo,
    floatGroupName, floatGroupHost, capacity, threshold,
    tokenAmount
  } = params
  if (tokenAmount > initFUSDAmount) throw "tokenAmount shoud less than initFUSDAmount"

  await mintFlow(signer, initFlowAmount)
  await setupFUSDVault(signer)

  await mintFUSD(await getAccountAddress("Deployer"), initFUSDAmount, signer)
  await checkFUSDBalance(signer, initFUSDAmount)

  const args = [
    name, description, image, url,
    startAt, endAt,
    FUSDInfo.tokenIssuer, FUSDInfo.tokenContractName, FUSDInfo.tokenSymbol,
    FUSDInfo.tokenProviderPath, FUSDInfo.tokenBalancePath, FUSDInfo.tokenReceiverPath,
    floatGroupName, floatGroupHost, capacity, threshold, 
    tokenAmount 
  ]
  return await createDrop_FLOATGroup_Random(signer, args)
}

export const createDefaultFUSDDrop_FLOATGroup_Random = async (signer, overrides = {}) => {
  const FUSDInfo = await getFUSDInfo()

  const {groupName, image, url, startAt, endAt, capacity, threshold} = overrides
  const args = {
    initFlowAmount: 100.0, 
    initFUSDAmount: 1000.0,
    name: "TEST", 
    description: "Test DROP", 
    image: image || null, url: url || null,
    startAt: startAt || null, endAt: endAt || null,
    FUSDInfo: FUSDInfo,
    floatGroupName: groupName || "GTEST",
    floatGroupHost: await getAccountAddress("FLOATCreator"),
    capacity: capacity || 2,
    threshold: threshold || 2,
    tokenAmount: 150.0
  }

  const [tx, error] = await createFUSDDrop_FLOATGroup_Random(signer, args)
  expect(error).toBeNull()
}

// ===== UTILS =====

export const getFUSDInfo = async () => {
  return {
    tokenIssuer: await getAccountAddress("Deployer"),
    tokenContractName: "FUSD",
    tokenSymbol: "FUSD",
    tokenProviderPath: "fusdVault", tokenBalancePath: "fusdBalance", tokenReceiverPath: "fusdReceiver"
  }
}

export const getDefaultWhitelist = async () => {
  const Bob = await getAccountAddress("Bob")
  const Carl = await getAccountAddress("Carl")

  return {
    [Bob]: "100.0",
    [Carl]: "50.0"
  }
}

export const createDefaultEvents = async (creator) => {
  await FLOAT_createEvent(creator, {eventName: "EVENT 1"})
  await FLOAT_createEvent(creator, {eventName: "EVENT 2"})
  await FLOAT_createEvent(creator, {eventName: "EVENT 3"})
}

// ===== TRANSACTIONS =====

export const toggleCloudPause = async (signer) => {
  const signers = [signer]
  const name = "toggle_cloud_pause"
  const args = []
  return await sendTransaction({ name: name, signers: signers, args: args })
}

export const claimDrop = async (dropID, host, claimer) => {
  const signers = [claimer]
  const name = "claim_drop"
  const args = [dropID, host]
  return await sendTransaction({ name: name, signers: signers, args: args })
}

export const depositToDrop = async (dropID, host, amount) => {
  const signers = [host]
  const name = "deposit_to_drop"
  const args = [dropID, amount]
  return await sendTransaction({ name: name, signers: signers, args: args})
}

export const withdrawAllFunds = async (dropID, host, tokenIssuer, tokenReceiverPath) => {
  const signers = [host]
  const name = "withdraw_all_funds"
  const args = [dropID, tokenIssuer, tokenReceiverPath]
  return await sendTransaction({ name: name, signers: signers, args: args})
}

export const deleteDrop = async (dropID, signer, tokenIssuer, tokenReceiverPath) => {
  const signers = [signer]
  const name = "delete_drop"
  const args = [dropID, tokenIssuer, tokenReceiverPath]
  return await sendTransaction({ name: name, signers: signers, args: args})
}


export const togglePause = async (dropID, host) => {
  const signers = [host]
  const name = "toggle_pause"
  const args = [dropID]
  return await sendTransaction({ name: name, signers: signers, args: args})
}

// ===== SCRIPTS =====

export const getAllDrops = async (account) => {
  const name = "get_all_drops"
  const args = [account]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

export const getClaimStatus = async (dropID, host, claimer) => {
  const name = "get_claim_status"
  const args = [dropID, host, claimer]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

export const getClaimedRecord = async (dropID, host, claimer) => {
  const name = "get_claimed_record"
  const args = [dropID, host, claimer]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

export const getClaimedRecords = async (dropID, host) => {
  const name = "get_claimed_records"
  const args = [dropID, host]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

export const getDrop = async (dropID, host, mustResolve = true) => {
  const name = "get_drop"
  const args = [dropID, host]
  const [result, error] = await executeScript({ name: name, args: args })
  if (mustResolve === true) {
    expect(error).toBeNull()
    return result
  }
  return [result, error]
}

export const getDropBalance = async (dropID, host) => {
  const name = "get_drop_balance"
  const args = [dropID, host]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

