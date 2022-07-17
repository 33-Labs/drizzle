import { RadioGroup } from '@headlessui/react'
import Hints from '../../lib/hints'
import { FloatModeFloatEvent, FloatModeFloatGroup } from '../float/FloatPicker'
import { checkPacketMode } from './PacketModeSelector'
import Decimal from 'decimal.js'

export const EligibilityModeWhitelistWitAmount = {
  key: "WhitelistWithAmount",
  name: 'Whitelist with Amount',
  intro: 'Distribute specific amount to specific one in whitelist',
  criteria: () => {
    return "In whitelist"
  },
  checkParams: (whitelistWithAmountReviewerCallback, tokenBalance) => {
    if (!whitelistWithAmountReviewerCallback) {
      return [false, Hints.NeedProcessRA]
    }
    if (whitelistWithAmountReviewerCallback.invalidRecordsCount > 0) {
      return [false, Hints.HaveInvalidRARecords]
    }
    if (whitelistWithAmountReviewerCallback.tokenAmount.cmp(tokenBalance) != -1) {
      return [false, Hints.InsufficientBalance]
    }

    return [true, Hints.Valid]
  }
}

export const EligibilityModeWhitelist = {
  key: "Whitelist",
  name: 'Whitelist',
  intro: 'Under construction',
  criteria: () => {
    return "In whitelist"
  },
  checkParams: (
    whitelistReviewerCallback, packetMode, totalBalance, capacity, amount = {}
  ) => {
    try {
      const [valid, hint] = checkPacketMode(packetMode, totalBalance, capacity, amount)
      if (!valid) {
        throw hint
      }
      if (!whitelistReviewerCallback) {
        throw Hints.NeedProcessR
      }
      if (whitelistReviewerCallback.invalidRecordsCount > 0) {
        throw Hints.HaveInvalidRRecords
      }

      return [true, Hints.Valid]
    } catch (error) {
      return [false, error]
    }
  } 
}

export const EligibilityModeFLOAT = {
  key: "FLOAT",
  name: 'FLOAT',
  intro: 'Under construction',
  detail: FloatModeFloatEvent,
  criteria: (eventID) => {
    let event = eventID || "{EventID}"
    return `Owns FLOAT of event #${event}`
  },
  checkParams: (floatEvents, threshold, packetMode, totalBalance, capacity, amount = {}) => {
    try {
      const [valid, hint] = checkPacketMode(packetMode, totalBalance, capacity, amount)
      if (!valid) {
        throw hint
      }
      if (floatEvents.length != 1) {
        throw Hints.InvalidFloatEvent
      }
      return [true, Hints.Valid]
    } catch (error) {
      return [false, error]
    }

    // NOTE: we only support single Event now
    // const _threshold = new Decimal(threshold)
    // if (!(_threshold.isInteger() && _threshold.isPositive() && _threshold.toNumber() <= floatEvents.length)) {
    //   throw Hints.InvalidThreshold
    // }
  } 
}

export const EligibilityModeFLOATGroup = {
  key: "FLOATGroup",
  name: 'FLOAT Group',
  intro: 'Under construction',
  detail: FloatModeFloatGroup,
  criteria: (groupName, threshold) => {
    let t = threshold || "1"
    let g = groupName || "{GroupName}"
    return `Owns at least ${t} FLOATs in ${g}`
  },
  checkParams: (floatEvents, threshold, packetMode, totalBalance, capacity, amount = {}) => {
    try {
      const [valid, hint] = checkPacketMode(packetMode, totalBalance, capacity, amount)
      if (!valid) {
        throw hint
      }

      if (floatEvents.length == 0) {
        throw Hints.EmptyFloatGroup
      }

      if (!threshold || isNaN(parseInt(threshold))) {
        throw Hints.InvalidThreshold
      }

      const _threshold = new Decimal(threshold)
      if (!(_threshold.isInteger() && _threshold.isPositive() && _threshold.toNumber() <= floatEvents.length)) {
        throw Hints.InvalidThreshold
      }

      return [true, Hints.Valid]
    } catch (error) {
      return [false, error]
    }
  }
}

const modes = [
  EligibilityModeFLOAT,
  EligibilityModeFLOATGroup,
  EligibilityModeWhitelist,
  EligibilityModeWhitelistWitAmount,
]

export default function EligibilityModeSelector(props) {
  const {mode, setMode} = props
  console.log(mode)

  return (
      <div className="mx-auto w-full">
        <RadioGroup value={mode} onChange={setMode}>
          <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-4 auto-rows-fr">
            {modes.map((mode) => (
              <RadioGroup.Option
                key={mode.key}
                value={mode}
                className={({ active, checked }) =>
                  `${
                    active
                      ? 'ring-2 ring-drizzle-green ring-offset-2'
                      : 'ring-1 ring-black ring-opacity-5'
                  }
                  ${
                    checked ? 'bg-drizzle-green/80 text-black' : 'bg-white'
                  }

                  relative flex cursor-pointer rounded-2xl px-5 py-4 shadow-md focus:outline-none`
                }
              >
                {({ active, checked }) => (
                  <>
                    <div className="flex w-full items-start justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <RadioGroup.Label
                            as="p"
                            className={`font-semibold font-flow text-lg`}
                          >
                            {mode.name}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className={`inline text-gray-500`}
                          >
                            {mode.intro}
                          </RadioGroup.Description>
                        </div>
                      </div>
                      {checked && (
                        <div className="shrink-0 text-white">
                          <CheckIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}