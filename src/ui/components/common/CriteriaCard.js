import { convertCadenceDateTime } from "../../lib/utils"
import publicConfig from "../../publicConfig"
import { EligibilityModeFLOAT, EligibilityModeFLOATGroup, EligibilityModeWhitelist, EligibilityModeWhitelistWitAmount } from "../eligibility/EligibilityModeSelector"

const getCriteriaLabel = (drizzle, type) => {
  let verifier = null
  if (type === "DROP") {
    if (!drizzle || Object.keys(drizzle.verifiers) <= 0) return null
    verifier = Object.values(drizzle.verifiers)[0][0]
  } else if (type === "Raffle") {
    if (!drizzle || Object.keys(drizzle.registrationVerifiers) <= 0) return null
    verifier = Object.values(drizzle.registrationVerifiers)[0][0]
  }
  // NOTE Only 1 verifier is supported now
  // WhitelistWithAmount & Whitelist
  if (verifier.type === "Whitelist") {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        {`On the whitelist of this ${type}`}
      </label>
    )
  }

  if (verifier.type === "FLOATGroup") {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        Own <span className="font-bold text-drizzle-green">{verifier.threshold} </span>
        FLOAT(s) in Group&nbsp;<span className="font-bold">
          <a
            href={`${publicConfig.floatURL}/${verifier.group.host}/group/${verifier.group.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-drizzle-green">
            {verifier.group.name}
          </a>
        </span>&nbsp;<span className="font-bold">MINTED BEFORE</span> <span className="font-bold text-drizzle-green">{convertCadenceDateTime(verifier.mintedBefore || verifier.receivedBefore).toLocaleString()}</span>
      </label>
    )
  }

  if (verifier.type === "FLOATs") {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        Own FLOAT of Event&nbsp;<span className="font-bold text-drizzle-green">
          <a
            href={`${publicConfig.floatURL}/${verifier.events[0].host}/event/${verifier.events[0].eventID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-drizzle-green">
            {verifier.events[0].eventID}
          </a>
        </span>&nbsp;<span className="font-bold">MINTED BEFORE</span> <span className="font-bold text-drizzle-green">{convertCadenceDateTime(verifier.mintedBefore || verifier.receivedBefore).toLocaleString()}</span>
      </label>
    )
  }
}

const getCriteriaLabelPreview = (
  eligibilityMode, floatGroup, floatEventPairs, threshold, type
) => {
  if (!eligibilityMode) return null
  // WhitelistWithAmount & Whitelist
  if (eligibilityMode.key === EligibilityModeWhitelistWitAmount.key ||
    eligibilityMode.key === EligibilityModeWhitelist.key) {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        {`On the whitelist of this ${type}`}
      </label>
    )
  }

  if (eligibilityMode.key === EligibilityModeFLOATGroup.key) {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        Own <span className="font-bold text-drizzle-green">{threshold} </span>
        FLOAT(s) in Group&nbsp;<span className="font-bold">
          <a
            href={`${publicConfig.floatURL}/${floatGroup.groupHost}/group/${floatGroup.groupName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-drizzle-green">
            {floatGroup.groupName}
          </a>
        </span>&nbsp;<span className="font-bold">MINTED BEFORE</span> <span className="font-bold text-drizzle-green">{new Date().toLocaleString()}</span>
      </label>
    )
  }

  if (eligibilityMode.key === EligibilityModeFLOAT.key) {
    const eventID = floatEventPairs[0].eventID
    const eventHost = floatEventPairs[0].eventHost
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        Own FLOAT of Event&nbsp;<span className="font-bold text-drizzle-green">
          <a
            href={`${publicConfig.floatURL}/${eventHost}/event/${eventID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-drizzle-green">
            {eventID}
          </a>
        </span>&nbsp;<span className="font-bold">MINTED BEFORE</span> <span className="font-bold text-drizzle-green">{new Date().toLocaleString()}</span>
      </label>
    )
  }
}

export default function CriteriaCard(props) {
  const {type, drop, raffle, eligibilityMode, floatGroup, floatEventPairs, threshold} = props
  const drizzle = drop ? drop : (raffle ? raffle : null)

  return (
    <div className="p-5 w-full min-w-[240px]
    shadow-drizzle bg-white
    ring-1 ring-black ring-opacity-5 rounded-3xl overflow-hidden
    sm:max-w-[240px]">
      <div className={`flex flex-col gap-y-2 ring-2 ring-drizzle-green rounded-2xl p-3 `}>
        <label className="text-center font-flow font-semibold">WHO IS ELIGIBLE?</label>
        {drizzle ?  getCriteriaLabel(drizzle, type)
        : getCriteriaLabelPreview(eligibilityMode, floatGroup, floatEventPairs, threshold, type)
        }
      </div>
    </div>
  )
}