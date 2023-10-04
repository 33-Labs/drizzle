import { 
  sendTransaction,
  shallPass,
  executeScript
} from "@onflow/flow-js-testing";

// ===== TRANSACTIONS =====

export const FLOAT_setupAccount = async (signer) => {
  const signers = [signer]
  const txName = "float/setup_account"
  const args = []
  await shallPass(sendTransaction({ name: txName, signers: signers, args: args }))
}

export const FLOAT_createEvent = async (signer, params = {}) => {
  const { eventName } = params
  const signers = [signer]
  const txName = "float/create_event"

  const claimable = true
  const name = eventName || "TEST"
  const description = "TEST"
  const image = ""
  const url = ""
  const transferrable = true
  const timelock = false
  const dateStart = "0.0"
  const timePeriod = "0.0"
  const secret = false
  const secretPK = ""
  const limited = false
  const capacity = "0"
  const flowTokenPurchase = false
  const flowTokenCost = "0.0"
  const minimumBalanceToggle = false
  const minimumBalance = "0.0"

  const args = [
    name, description, url, image, image, image, transferrable, claimable, "TEST", "medal",
    timelock, dateStart, timePeriod, secret, secretPK, limited, capacity,
    flowTokenPurchase, flowTokenCost, minimumBalanceToggle, minimumBalance, "certificate", false
  ]
  await shallPass(sendTransaction({ name: txName, signers: signers, args: args }))
}

export const FLOAT_createEventsWithGroup = async (signer) => {
  await FLOAT_createEvent(signer, { eventName: "TEST 1"})
  await FLOAT_createEvent(signer, { eventName: "TEST 2"})
  await FLOAT_createEvent(signer, { eventName: "TEST 3"})
}

export const FLOAT_claim = async (signer, eventID, eventHost) => {
  const signers = [signer]
  const txName = "float/claim"

  const args = [
    eventID, eventHost, null 
  ]

  await shallPass(sendTransaction({ name: txName, signers: signers, args: args })) 
}

export const FLOAT_transfer = async (signer, floatID, recipient) => {
  const signers = [signer]
  const txName = "float/transfer_float"

  const args = [
    floatID, recipient
  ]

  await shallPass(sendTransaction({ name: txName, signers: signers, args: args })) 
}

// ===== SCRIPTS =====

export const FLOAT_getEvent = async (account, eventID) => {
  const name = "float/get_event"
  const args = [account, eventID]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

export const FLOAT_getEventIDs = async (account) => {
  const name = "float/get_event_ids"
  const args = [account]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

export const FLOAT_getEventsInGroup = async (account, groupName) => {
  const name = "float/get_events_in_group"
  const args = [account, groupName]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

export const FLOAT_getFLOATIDs = async (account) => {
  const name = "float/get_float_ids"
  const args = [account]
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}

