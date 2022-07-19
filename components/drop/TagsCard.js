import publicConfig from "../../publicConfig"
import { EligibilityModeFLOAT, EligibilityModeFLOATGroup, EligibilityModeWhitelist, EligibilityModeWhitelistWitAmount } from "../eligibility/EligibilityModeSelector"
import { PacketModeIdentical, PacketModeRandom } from "../eligibility/PacketModeSelector"

const getReviewerTitle = (reviewer) => {
  // Whitelist or WhitelistWithAmount
  if (reviewer.whitelist) {
    return "Whitelist"
  }
  if (reviewer.group) {
    return "FLOAT Group"
  }
  if (reviewer.events) {
    return "FLOAT"
  }
}

const getReviewerTitlePreview = (eligibilityMode) => {
  // Whitelist or WhitelistWithAmount
  if (eligibilityMode.key === EligibilityModeWhitelist.key ||
    eligibilityMode.key === EligibilityModeWhitelistWitAmount.key) {
    return "Whitelist"
  }
  if (eligibilityMode.key === EligibilityModeFLOATGroup.key) {
    return "FLOAT Group"
  }
  if (eligibilityMode.key === EligibilityModeFLOAT.key) {
    return "FLOAT"
  }
}

const getPacketMode = (packet) => {
  if (packet.totalAmount) return "Random"
  if (packet.amountPerPacket) return "Identical"
  return null
}

const getPacketPreview = (packetMode) => {
  if (packetMode.key === PacketModeIdentical.key) { return "Identical" }
  if (packetMode.key === PacketModeRandom.key) { return "Random" }
  return null
}

const getEligibilityTag = (reviewer, eligibilityMode) => {
  if (reviewer) {
    return (
      <div
        className="px-2 bg-blue-300 rounded-full font-flow font-medium text-sm"
        data-tip="same amount to all users">
        <label>
          {getReviewerTitle(reviewer)}
        </label>
      </div>
    )
  }
  if (eligibilityMode) {
    return (
      <div
        className="px-2 bg-blue-300 rounded-full font-flow font-medium text-sm"
        data-tip="same amount to all users">
        <label>
          {getReviewerTitlePreview(eligibilityMode)}
        </label>
      </div>
    )
  }
  return null
}

const getPacketTag = (reviewer, packetMode) => {
  if (reviewer && reviewer.packet) {
    return (
      <div
        className="tooltip px-2 bg-yellow-300 rounded-full font-flow font-medium text-sm"
        data-tip="same amount to all users">
        <label>
          {getPacketMode(reviewer.packet)}
        </label>
      </div>
    )
  }

  if (packetMode) {
    return (
      <div
        className="tooltip px-2 bg-yellow-300 rounded-full font-flow font-medium text-sm"
        data-tip="same amount to all users">
        <label>
          {getPacketPreview(packetMode)}
        </label>
      </div>
    )
  }
  return null
}

export default function TagsCard(props) {
  const { token, tokenInfo, reviewer, eligibilityMode, packetMode } = props
  const symbol = tokenInfo ? tokenInfo.symbol : (token ? token.symbol : null)
  const identifer = tokenInfo ? tokenInfo.tokenIdentifier : (token ? `A.${token.address}.${token.contractName}` : null)

  return (
    <div className={`flex gap-x-1 mb-2`}>
      {getEligibilityTag(reviewer, eligibilityMode)}
      {getPacketTag(reviewer, packetMode)}
      <a
        href={`${publicConfig.flowscanURL}/contract/${identifer}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 bg-drizzle-green rounded-full font-flow font-medium text-sm"
      >
        <label>{symbol}</label>
      </a>
    </div>
  )
}