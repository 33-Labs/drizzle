import { convertCadenceDateTime } from "../../lib/utils"
import publicConfig from "../../publicConfig"
import { EligibilityModeFLOAT, EligibilityModeFLOATGroup, EligibilityModeWhitelist, EligibilityModeWhitelistWitAmount } from "../eligibility/EligibilityModeSelector"

const getCriteriaLabel = (drop) => {
  if (!drop || !drop.eligibilityReviewer) return null
  const reviewer = drop.eligibilityReviewer
  // WhitelistWithAmount & Whitelist
  if (reviewer.whitelist) {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        On the whitelist of this DROP
      </label>
    )
  }

  if (reviewer.group) {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        Own <span className="font-bold text-drizzle-green">{reviewer.threshold} </span>
        FLOAT(s) in Group&nbsp;<span className="font-bold">
          <a
            href={`${publicConfig.floatURL}/${reviewer.group.host}/group/${reviewer.group.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-drizzle-green">
            {reviewer.group.name}
          </a>
        </span>&nbsp;before <span className="font-bold text-drizzle-green">{convertCadenceDateTime(reviewer.receivedBefore).toLocaleString()}</span>
      </label>
    )
  }

  if (reviewer.events) {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        Own FLOAT of Event&nbsp;<span className="font-bold text-drizzle-green">
          <a
            href={`${publicConfig.floatURL}/${reviewer.events[0].host}/event/${reviewer.events[0].eventID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-drizzle-green">
            {reviewer.events[0].eventID}
          </a>
        </span>&nbsp;before <span className="font-bold text-drizzle-green">{convertCadenceDateTime(reviewer.receivedBefore).toLocaleString()}</span>
      </label>
    )
  }
}

const getCriteriaLabelPreview = (
  eligibilityMode, packetMode, floatGroup, floatEventPairs, threshold
) => {
  if (!eligibilityMode) return null
  // WhitelistWithAmount & Whitelist
  if (eligibilityMode.key === EligibilityModeWhitelistWitAmount.key ||
    eligibilityMode.key === EligibilityModeWhitelist.key) {
    return (
      <label className="w-full font-flow font-medium text-sm break-words">
        On the whitelist of this DROP
      </label>
    )
  }

  if (!packetMode) return null

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
        </span>&nbsp;before <span className="font-bold text-drizzle-green">{new Date().toLocaleString()}</span>
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
        </span>&nbsp;before <span className="font-bold text-drizzle-green">{new Date().toLocaleString()}</span>
      </label>
    )
  }
}

export default function CriteriaCard(props) {
  const {drop, eligibilityMode, packetMode, floatGroup, floatEventPairs, threshold} = props

  return (
    <div className="p-5 w-full min-w-[240px]
    shadow-drizzle bg-white
    ring-1 ring-black ring-opacity-5 rounded-3xl overflow-hidden
    sm:max-w-[240px]">
      <div className={`flex flex-col gap-y-2 ring-2 ring-drizzle-green rounded-2xl p-3 `}>
        <label className="text-center font-flow font-semibold">WHO IS ELIGIBLE?</label>
        {drop ?  getCriteriaLabel(drop)
        : getCriteriaLabelPreview(eligibilityMode, packetMode, floatGroup, floatEventPairs, threshold)
        }
      </div>
    </div>
  )
}