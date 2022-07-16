import Decimal from "decimal.js"

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

export const isValidHttpUrl = (string) => {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === "http:" || url.protocol === "https:"
}

// Recipients & Amounts Records Helpers

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

export const isValidFlowAddress = (address) => {
  if (!address.startsWith("0x") || address.length != 18) { 
    return false
  }

  const bytes = Buffer.from(address.replace("0x", ""), "hex")
  if (bytes.length != 8) { return false }
  return true
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
      if (!isValidFlowAddress(address)) { throw "Invalid address"}
      if (addresses[address]) { throw "Duplicate address" }
      addresses[address] = true
      validRecords.push({ id: i, address: address, amount: amount, rawRecord: rawRecord })
    } catch (e) {
      invalidRecords.push(rawRecord)
    }
  }
  return [validRecords, invalidRecords]
}