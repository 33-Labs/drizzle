import Decimal from "decimal.js"
import publicConfig from "../publicConfig"

export const convertCadenceDateTime = (rawDate) => {
  if (!rawDate) {
    return null
  }

  if (typeof rawDate.getMonth === 'function') {
    return rawDate
  }

  return new Date(parseFloat(rawDate) * 1000)
}

export const getTimezone = () => {
  return (new Date()).toTimeString().slice(9).split(" ")[0]
}

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const floatEventInputHandler = (raw) => {
  const result = raw.trim().replace("#", "").split("@")
  let host = ''
  let id = '0'
  if (result.length != 2) {
    const urlParseResult = decodeURI(raw.trim()).replace(`${publicConfig.floatURL}/`, "").replaceAll("/", "").split('event')
    if (urlParseResult.length != 2) {
      throw "Invalid pair"
    }

    [host, id] = urlParseResult
  } else {
    [id, host] = result
  }

  if (!isValidFlowAddress(host)) {
    throw "Invalid address"
  }

  const _id = new Decimal(id)
  if (!(_id.isInteger() && _id.isPositive() && !_id.isZero())) {
    throw "Invalid event id"
  }

  return [{ eventID: id, eventHost: host }]
}

export const floatGroupInputHandler = (raw) => {
  const result = raw.trim().replace("#", "").split("@")
  let host = ''
  let groupName = ''
  if (result.length != 2) {
    const urlParseResult = decodeURI(raw.trim()).replace(`${publicConfig.floatURL}/`, "").replaceAll("/", "").split('group')
    if (urlParseResult.length != 2) {
      throw "Invalid pair"
    }

    [host, groupName] = urlParseResult
  } else {
    [groupName, host] = result
  }

  if (!isValidFlowAddress(host)) {
    throw "Invalid address"
  }

  if (groupName && groupName == '') {
    throw "Invalid groupName"
  }

  return { groupName: groupName, groupHost: host }
}

export const isValidHttpUrl = (string) => {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === "http:" || url.protocol === "https:"
}

export const isValidFlowAddress = (address) => {
  if (!address.startsWith("0x") || address.length != 18) {
    return false
  }

  const bytes = Buffer.from(address.replace("0x", ""), "hex")
  if (bytes.length != 8) { return false }
  return true
}

// LIVE green
// PAUSED gray
// COMING blue
// ENDED red
export const DropStatus = {
  PAUSED: {
    title: "PAUSED",
    tagColor: "text-yellow-800 bg-yellow-100"
  },
  COMING: {
    title: "COMING",
    tagColor: "text-blue-800 bg-blue-100"
  },
  END: {
    title: "END",
    tagColor: "text-red-800 bg-red-100"
  },
  LIVE: {
    title: "LIVE",
    tagColor: "text-green-800 bg-green-100"
  },
  UNKNOWN: {
    title: "UNKNOWN",
    tagColor: "text-gray-800 bg-gray-100"
  }
}

export const getDropCriteria = (drop) => {
  if (!drop || !drop.eligibilityReviewer) return "UNKNOWN"
  const reviewer = drop.eligibilityReviewer
  // WhitelistWithAmount
  if (reviewer.whitelist && !reviewer.packet) {
    return "In Whitelist"
  }
  if (reviewer.whitelist && reviewer.packet) {
    return "In Whitelist"
  }
  if (reviewer.group) {
    return `Owned ${reviewer.threshold} FLOAT(s) in ${reviewer.group.name}@${reviewer.group.host} before ${convertCadenceDateTime(reviewer.receivedBefore).toLocaleString()}`
  }
  if (reviewer.events) {
    return "FLOAT"
  } 
}


export const getDropStatus = (drop) => {
  if (!drop || !drop.eligibilityReviewer) return DropStatus.UNKNOWN
  if (drop.isPaused) return DropStatus.PAUSED
  if (drop.startAt && 1000 * parseFloat(drop.startAt) > new Date().getTime()) {
    return DropStatus.COMING
  }
  if (drop.endAt && 1000 * parseFloat(drop.endAt) < new Date().getTime()) {
    return DropStatus.END
  }
  const claimed = Object.keys(drop.claimedRecords).length
  const eligibilityMode = getEligibilityMode(drop)
  let capacity = 0
  if (eligibilityMode === "Whitelist" && !drop.eligibilityReviewer.packet) {
    capacity = Object.keys(drop.eligibilityReviewer.whitelist).length
  } else {
    capacity = parseInt(drop.eligibilityReviewer.packet.capacity)
  }
  if (claimed === capacity) {
    return DropStatus.END
  }
  return DropStatus.LIVE
}

export const getPacket = (drop) => {
  if (!drop || !drop.eligibilityReviewer) return null
  const reviewer = drop.eligibilityReviewer
  const packet = reviewer.packet
  if (reviewer.whitelist && !packet) return "Specific"
  if (!packet) return null
  if (packet.totalAmount) return "Random"
  if (packet.amountPerPacket) return "Identical"
  return null
}

export const getEligibilityMode = (drop) => {
  if (!drop || !drop.eligibilityReviewer) return null
  const reviewer = drop.eligibilityReviewer
  // WhitelistWithAmount
  if (reviewer.whitelist && !reviewer.packet) {
    return "Whitelist"
  }
  if (reviewer.whitelist && reviewer.packet) {
    return "Whitelist"
  }
  if (reviewer.group) {
    return "FLOAT Group"
  }
  if (reviewer.events) {
    return "FLOAT"
  }
}

// Whitelist Helpers

export const getWhitelistFromAddresses = (addresses) => {
  let whitelist = []
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i]
    const claim = {
      key: address,
      value: true
    }
    whitelist.push(claim)
  }

  return whitelist
}

export const filterAddresses = (rawRecordsStr) => {
  const rawRecords = rawRecordsStr.trim().split("\n").filter((r) => r != '')

  let addresses = {}
  let validAddresses = []
  let invalidAddresses = []

  for (var i = 0; i < rawRecords.length; i++) {
    let address = rawRecords[i].trim()

    try {
      if (!isValidFlowAddress(address)) { throw "Invalid address" }
      if (addresses[address]) { throw "Duplicate addresses" }
      addresses[address] = true
      validAddresses.push(address)
    } catch (e) {
      invalidAddresses.push(address)
    }
  }
  return [validAddresses, invalidAddresses]
}


// WhitelistWithAmount Helpers

export const getWhitelistFromRecords = (records) => {
  let whitelist = []
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const claim = {
      key: record.address,
      value: record.amount.toFixed(8).toString()
    }
    whitelist.push(claim)
  }

  return whitelist
}

export const filterRecords = (rawRecordsStr) => {
  const rawRecords = rawRecordsStr.trim().split("\n").filter((r) => r != '')

  let addresses = {}
  let validRecords = []
  let invalidRecords = []

  for (var i = 0; i < rawRecords.length; i++) {
    let rawRecord = rawRecords[i].trim()

    try {
      const [address, rawAmount] = rawRecord.split(",")
      const amount = new Decimal(rawAmount)
      if (!amount.isPositive() || amount.decimalPlaces() > 8) { throw "Invalid amount. Should be positive with 8 decimal places at most" }
      if (!isValidFlowAddress(address)) { throw "Invalid address" }
      if (addresses[address]) { throw "Duplicate addresses" }
      addresses[address] = true
      validRecords.push({ id: i, address: address, amount: amount, rawRecord: rawRecord })
    } catch (e) {
      invalidRecords.push(rawRecord)
    }
  }
  return [validRecords, invalidRecords]
}