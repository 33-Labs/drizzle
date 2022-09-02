import { getDistributorType, getVerifierType } from "../../lib/utils"
import publicConfig from "../../publicConfig"
import { EligibilityModeFLOAT, EligibilityModeFLOATGroup, EligibilityModeWhitelist, EligibilityModeWhitelistWitAmount } from "../eligibility/EligibilityModeSelector"
import { PacketModeIdentical, PacketModeRandom } from "../drop/PacketModeSelector"

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

const getEligibilityTag = ({drop, eligibilityMode, raffle}) => {
  const type = drop ? "DROP" : "RAFFLE"
  if (drop || raffle) {
    return (
      <div
        className="px-2 bg-blue-300 rounded-full font-flow font-medium text-sm"
        data-tip="same amount to all users">
        <label>
          {getVerifierType(drop ? drop : raffle, type)}
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

const getPacketTag = ({drop, packetMode}) => {
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

const getIdentifier = (info) => {
  if (info.drop) {
    return info.drop.tokenInfo.tokenIdentifier
  } else if (info.token) {
    return `A.${info.token.address}.${info.token.contractName}`
  } else if (info.raffle) {
    return `A.${info.raffle.nftInfo.contractAddress.replace("0x", "")}.${info.raffle.nftInfo.contractName}`
  } else if (info.nft) {
    return `A.${info.nft.contractAddress.replace("0x", "")}.${info.nft.contractName}`
  }
}

const getSymbol = (info) => {
  if (info.drop) {
    return info.drop.tokenInfo.symbol
  } else if (info.token) {
    return info.token.symbol
  } else if (info.raffle) {
    return info.raffle.nftInfo.name
  } else if (info.nft) {
    return info.nft.name
  }
}

export default function TagsCard(props) {
  const { info } = props

  return (
    <div className={`flex gap-x-1 mb-2`}>
      {getEligibilityTag(info)}
      {info.type == "DROP" ? getPacketTag(info) : null}
      <a
        href={`${publicConfig.flowscanURL}/contract/${getIdentifier(info)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 bg-drizzle-green rounded-full font-flow font-medium text-sm"
      >
        <label>{getSymbol(info)}</label>
      </a>
    </div>
  )
}