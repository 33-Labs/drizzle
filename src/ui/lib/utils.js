import Decimal from "decimal.js"
import publicConfig from "../publicConfig"

export const convertURI = (uri) => {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`
  }
  return uri
}

export const generateImportsAndInterfaces = (restrictions) => {
  const contracts = {}
  const interfacesArr = []
  for (let i = 0; i < restrictions.length; i++) {
    const r = restrictions[i]
    const [, address, name, interf] = r.split(".") 
    contracts[name] = address
    interfacesArr.push(`${name}.${interf}`)
  }
  let imports = ``
  for (const [name, address] of Object.entries(contracts)) {
    imports = imports.concat(`import ${name} from 0x${address}\n`)
  }
  const interfaces = interfacesArr.join(", ")
  return [imports, interfaces]
}

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

export const RaffleStatus = {
  PAUSED: {
    title: "PAUSED",
    tagColor: "text-yellow-800 bg-yellow-100"
  },
  COMING: {
    title: "COMING",
    tagColor: "text-blue-800 bg-blue-100"
  },
  REGISTERING: {
    title: "REGISTERING",
    tagColor: "text-green-800 bg-green-100"
  },
  DRAWING: {
    title: "DRAWING",
    tagColor: "text-yellow-800 bg-yellow-100"
  },
  DRAWN: {
    title: "DRAWN",
    tagColor: "text-green-800 bg-green-100"
  },
  END: {
    title: "END",
    tagColor: "text-red-800 bg-red-100"
  },
  UNKNOWN: {
    title: "UNKNOWN",
    tagColor: "text-gray-800 bg-gray-100"
  }
}

export const getItemsInPage = (totalItems, page, pageSize) => {
  const items = totalItems.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
  return items
}

export const getRaffleStatus = (raffle) => {
  if (!raffle || Object.keys(raffle.registrationVerifiers) <= 0) return RaffleStatus.UNKNOWN
  if (raffle.isEnded) return RaffleStatus.END
  if (raffle.startAt && 1000 * parseFloat(raffle.startAt) > new Date().getTime()) {
    return RaffleStatus.COMING
  }
  if (raffle.endAt && 1000 * parseFloat(raffle.endAt) < new Date().getTime()) {
    return RaffleStatus.END
  }
  if (raffle.isPaused) return RaffleStatus.PAUSED
  let winnersCount = Object.keys(raffle.winners).length
  if (winnersCount == raffle.numberOfWinners) {
    return RaffleStatus.DRAWN
  } 
  if (new Date().getTime() > 1000 * parseFloat(raffle.registrationEndAt)) {
    if (raffle.candidates.length == 0) {
      return RaffleStatus.DRAWN
    }
    return RaffleStatus.DRAWING
  }
  return RaffleStatus.REGISTERING
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

export const getDropStatus = (drop) => {
  if (!drop || Object.keys(drop.verifiers) <= 0) return DropStatus.UNKNOWN
  if (drop.isEnded) return DropStatus.END
  if (drop.isPaused) return DropStatus.PAUSED
  if (drop.startAt && 1000 * parseFloat(drop.startAt) > new Date().getTime()) {
    return DropStatus.COMING
  }
  if (drop.endAt && 1000 * parseFloat(drop.endAt) < new Date().getTime()) {
    return DropStatus.END
  }
  const verifier = Object.values(drop.verifiers)[0][0]
  const claimed = Object.keys(drop.claimedRecords).length
  let capacity = 0
  if (verifier.type === "Whitelist" && drop.distributor.type === "Exclusive") {
    capacity = Object.keys(drop.distributor.distributeList).length
  } else {
    capacity = parseInt(drop.distributor.capacity)
  }
  if (claimed === capacity) {
    return DropStatus.END
  }
  return DropStatus.LIVE
}

export const getDistributorType = (drop) => {
  if (!drop) return null
  return drop.distributor.type
}

export const getVerifierType = (drizzle, type) => {
  let verifier = null
  if (type == "DROP") {
    if (!drizzle || Object.keys(drizzle.verifiers) <= 0) return null
    verifier = Object.values(drizzle.verifiers)[0][0]
  } else {
    if (!drizzle || Object.keys(drizzle.registrationVerifiers) <= 0) return null
    verifier = Object.values(drizzle.registrationVerifiers)[0][0]
  }

  if (verifier.type === "Whitelist") return "Whitelist"
  if (verifier.type === "FLOATGroup") return "FLOAT Group"
  if (verifier.type === "FLOATs") return "FLOAT"
}

// NFTSelector Helpers

export const filterTokenIDs = (rawRecordsStr) => {
  const rawRecords = rawRecordsStr.trim().split("\n").filter((r) => r != '')
  let tokenIDs = {}
  let validTokenIDs = []
  let invalidTokenIDs = []

  for (var i = 0; i < rawRecords.length; i++) {
    let rawRecord = rawRecords[i].trim()

    try {
      if (tokenIDs[rawRecord]) throw "Duplicate tokenIDs"
      const tokenID = new Decimal(rawRecord)
      if (tokenID.isPositive() && tokenID.isInteger()) {
        validTokenIDs.push(tokenID.toNumber())
      } else {
        throw "invalid tokenID"
      }
    } catch (e) {
      invalidTokenIDs.push(rawRecord)
    }
    return [validTokenIDs, invalidTokenIDs]
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