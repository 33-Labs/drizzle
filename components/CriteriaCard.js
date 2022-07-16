import { CheckCircleIcon } from "@heroicons/react/outline"
import { EligilityModeWhitelistWitAmount } from "./EligilityModeSelector"

export default function CriteriaCard(props) {
  const isEligible = props.isEligible ?? false
  const eligilityMode = props.mode|| EligilityModeWhitelistWitAmount

  return (
    <div className="p-5 w-full min-w-[240px]
    shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]
    ring-1 ring-black ring-opacity-5 rounded-3xl overflow-hidden
    sm:max-w-[240px]">
      <div className={`flex gap-x-2
    ring-2 ring-drizzle-green rounded-2xl
    p-3 
    `}>
        <CheckCircleIcon className="shrink-0 h-6 w-6 text-drizzle-green" aria-hidden="true" />
        <label className="font-flow font-bold text-base">
          {eligilityMode.criteria()}
        </label>
      </div>
    </div>
  )
}