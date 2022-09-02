import { useState, useEffect } from 'react'

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
} from "../../lib/atoms"
import { classNames, floatEventInputHandler, floatGroupInputHandler, isValidFlowAddress } from "../../lib/utils"
import { getFloatEvent, getFloatEventsInGroup } from '../../lib/float-scripts'
import FloatEventList from './FloatEventList'
import Warning from '../common/Warning'
import publicConfig from '../../publicConfig'

export const FloatModeFloatEvent = {
  key: "FLOATEvent",
  title: "FLOAT Event",
  description: `Enter the url of the FLOAT Event. Or enter event id and event host, concat them with "@". For instance: ${publicConfig.chainEnv == "testnet" ? "98963710@0x257c27ba4951541d" : "420442474@0x39b144ab4d348e2b"}.`,
  placeholder: `${publicConfig.chainEnv == "testnet" ? "98963710@0x257c27ba4951541d" : "420442474@0x39b144ab4d348e2b"}`,
  inputHandler: floatEventInputHandler
}

export const FloatModeFloatGroup = {
  key: "FLOATGroup",
  title: "FLOAT Group",
  description: `Enter the url of the FLOAT Group. Or enter group name and group creator, concat them with "@". For instance: ${publicConfig.chainEnv == "testnet" ? "Drizzle@0x257c27ba4951541d" : "Drizzle@0x39b144ab4d348e2b"}.`,
  placeholder: `${publicConfig.chainEnv == "testnet" ? "Drizzle@0x257c27ba4951541d" : "Drizzle@0x39b144ab4d348e2b"}`,
  inputHandler: floatGroupInputHandler
}

export default function FloatPicker(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)

  const [rawEventStr, setRawEventStr] = useState('')

  // FLOAT || FLOATGroup
  const mode = props.mode || FloatModeFloatEvent
  const disabled = props.disabled || false

  const {
    threshold, setThreshold,
    rawFloatInput,
    floatEvents,
    setFloatEvents,
    setFloatGroup,
    setFloatEventPairs
  } = props
  
  useEffect(() => {
    if (floatEvents.length == 1) {
      setThreshold(1)
    }
  }, [floatEvents])

  useEffect(() => {
    setThreshold('')
    setFloatEvents([])
    setFloatGroup(null)
    setFloatEventPairs([])
    setRawEventStr('')
  }, [mode])

  useEffect(() => {
    if (rawFloatInput) {
      setRawEventStr(rawFloatInput)
    }
  }, [rawFloatInput])

  return (
    <div className="space-y-2">
      <label className="block text-2xl font-bold font-flow">
        {mode.title}<span className="text-red-600">*</span>
      </label>
      <Warning content="FLOAT(s) received after the creation of this DROP will not be counted in when checking eligibility." />
      <label className="block font-flow text-md leading-6 mt-2 mb-2">
        {mode.description}
      </label>
      <div className="w-full flex justify-between gap-x-2 sm:gap-x-3">
        <input
          type="text"
          name="floatPicker"
          id="floatPicker"
          className="w-full bg-drizzle-green-ultralight grow border-drizzle-green font-flow text-lg rounded-2xl
          focus:ring-drizzle-green-dark focus:border-drizzle-green-dark  placeholder:text-gray-300"
          disabled={transactionInProgress}
          value={rawEventStr}
          placeholder={mode.placeholder}
          onChange={(event) => {
            setRawEventStr(event.target.value)
          }}
        />
        <button
          type="button"
          className={classNames(
            transactionInProgress ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
            `rounded-xl h-12 px-3 sm:px-6 text-base font-medium shadow-sm text-black`
          )}
          disabled={transactionInProgress}
          onClick={async () => {
            setFloatEventPairs([])
            setFloatEvents([])
            setShowBasicNotification(false)
            if (rawEventStr && mode) {
              try {
                let events = []
                if (mode.key === "FLOATEvent") {
                  const floatEvents = await mode.inputHandler(rawEventStr)
                  for (let i = 0; i < floatEvents.length; i++) {
                    let floatEvent = floatEvents[i]
                    let event = await getFloatEvent(floatEvent.eventHost, floatEvent.eventID)
                    if (event) {
                      events.push(event)
                    }
                  }
                  if (events.length > 0) {
                    setFloatEventPairs(floatEvents)
                    setFloatEvents(events)
                  } else {
                    throw "No events"
                  }
                } else if (mode.key === "FLOATGroup") {
                  const group = await mode.inputHandler(rawEventStr)
                  const _events = await getFloatEventsInGroup(group.groupHost, group.groupName)
                  if (_events && _events.length > 0) {
                    events = _events.sort((a, b) => b.eventId - a.eventId)
                    setFloatGroup(group)
                    setFloatEvents(events)
                  } else {
                    throw "Group not exist or no events in group"
                  }
                }

              } catch (error) {
                let err = error.message || error
                if (err.includes("This event does not exist in the account")) {
                  err = "This event does not exist in the account"
                } else if (err.includes("This group doesn't exist")) {
                  err = "This group doesn't exist"
                }
                setShowBasicNotification(true)
                setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: err })
              }
            } else {
              setShowBasicNotification(true)
              setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: "invalid FLOAT info or mode" })
            }
          }}
        >
          Sync
        </button>
      </div>
      {floatEvents.length > 0 ?
        <div className="w-full mt-2">
          <FloatEventList events={floatEvents} />
          {
            floatEvents.length > 1 ?
              <div className="w-full flex flex-col gap-y-2 mt-3">
                <div className="flex items-center gap-x-2 sm:justify-between sm:w-full">
                  <label className="block w-[75px] shrink-0 font-flow font-bold">Threshold</label>
                  <input
                    type="number"
                    disabled={disabled}
                    min="1"
                    max={floatEvents.length}
                    value={threshold}
                    id="threshold"
                    className="grow w-full rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green-ultralight border-drizzle-green font-flow text-lg placeholder:text-gray-300"
                    onWheel={(e) => e.target.blur()}
                    onChange={(event) => { setThreshold(event.target.value) }}
                  />
                  <label className="shrink-0 font-float font-bold">of {floatEvents.length} FLOATs</label>
                </div>
              </div> : null
          }
        </div>
        : null
      }
    </div>
  )
}