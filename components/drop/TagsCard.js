import { getDistributorType, getVerifierType } from "../../lib/utils"
import publicConfig from "../../publicConfig"
import { EligibilityModeFLOAT, EligibilityModeFLOATGroup, EligibilityModeWhitelist, EligibilityModeWhitelistWitAmount } from "../eligibility/EligibilityModeSelector"
import { PacketModeIdentical, PacketModeRandom } from "../eligibility/PacketModeSelector"

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

const getPacketPreview = (packetMode) => {
  if (!packetMode) { return "Exclusive" }
  if (packetMode.key === PacketModeIdentical.key) { return "Identical" }
  if (packetMode.key === PacketModeRandom.key) { return "Random" }
}

const getEligibilityTag = (drop, eligibilityMode) => {
  if (drop) {
    return (
      <div
        className="px-2 bg-blue-300 rounded-full font-flow font-medium text-sm"
        data-tip="same amount to all users">
        <label>
          {getVerifierType(drop)}
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

const getPacketTag = (drop, packetMode) => {
  if (drop) {
    return (
      <div
        className="tooltip px-2 bg-yellow-300 rounded-full font-flow font-medium text-sm"
        data-tip="same amount to all users">
        <label>
          {getDistributorType(drop)}
        </label>
      </div>
    )
  }

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

export default function TagsCard(props) {
  const { token, eligibilityMode, packetMode, drop } = props
  const symbol = drop ? drop.tokenInfo.symbol : (token ? token.symbol : null)
  const identifer = drop ? drop.tokenInfo.tokenIdentifier : (token ? `A.${token.address}.${token.contractName}` : null)

  return (
    <div className={`flex gap-x-1 mb-2`}>
      {getEligibilityTag(drop, eligibilityMode)}
      {getPacketTag(drop, packetMode)}
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