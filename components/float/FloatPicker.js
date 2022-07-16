import { useState, useEffect } from 'react'

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
} from "../../lib/atoms"
import { classNames, isValidFlowAddress } from "../../lib/utils"
import { getFloatEvent, getFloatEventsInGroup } from '../../lib/float-scripts'
import Decimal from 'decimal.js'
import FloatEventList from './FloatEventList'

export const FloatModeFloatEvent = {
  title: "FLOAT Event",
  description: `Enter event id and event host, concat them with "@". For instance: 98963710@0x257c27ba4951541d`,
  placeholder: "98963710@0x257c27ba4951541d",
  inputHandler: async (raw) => {
    const result = raw.trim().replace("#", "").split("@")
    console.log(result)
    if (result.length != 2) {
      throw "Invalid pair"
    }

    const [id, host] = result
    if (!isValidFlowAddress(host)) {
      throw "Invalid address"
    }

    const _id = new Decimal(id)
    if (!(_id.isInteger() && _id.isPositive())) {
      throw "Invalid event id"
    } 

    const event = await getFloatEvent(host, id)
    if (event) {
      return [event]
    }

    return []
  }
}

export const FloatModeFloatGroup = {
  title: "FLOAT Group",
  description: `Enter group name and event host, concat them with "@". For instance: Drizzle@0x257c27ba4951541d`,
  placeholder: "Drizzle@0x257c27ba4951541d",
  inputHandler: async (raw) => {
    const result = raw.trim().replace("#", "").split("@")
    console.log(result)
    if (result.length != 2) {
      throw "Invalid pair"
    }

    const [groupName, host] = result
    if (!isValidFlowAddress(host)) {
      throw "Invalid address"
    }

    const events = await getFloatEventsInGroup(host, groupName)
    console.log(events)
    return events.sort((a, b) => b.eventId - a.eventId)
  }
}

export default function FloatPicker(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress, ] = useRecoilState(transactionInProgressState)

  const [rawEventStr, setRawEventStr] = useState('')
  const [floatEvents, setFloatEvents] = useState([])
  const [threshold, setThreshold] = useState(1)


  // FLOAT || FLOATGroup
  const mode = props.mode || PickerModeFloat
  const disabled = props.disabled || false

  useEffect(() => {
    setFloatEvents([])
    setRawEventStr('')
    setThreshold('')
  }, [mode])

  return (
    <div className="space-y-2">
      <label className="block text-2xl font-bold font-flow">
        {mode.title}
      </label>
      <label className="block font-flow text-md leading-6 mt-2 mb-2">
        {mode.description}
      </label>
      <div className="w-full flex justify-between gap-x-2 sm:gap-x-3">
        <input
          type="text"
          name="deposit"
          id="deposit"
          className="bg-drizzle-green/10 grow border-drizzle-green font-flow text-lg rounded-2xl
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
            transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
            `rounded-xl h-12 px-3 sm:px-6 text-base font-medium shadow-sm text-black`
          )}
          disabled={transactionInProgress}
          onClick={async () => {
            setShowBasicNotification(false)
            if (rawEventStr) {
              try {
                const floatEvents = await mode.inputHandler(rawEventStr)
                setFloatEvents(floatEvents)
              } catch (error) {
                console.log("error is ", error)
                let err = error.message || error
                setShowBasicNotification(true)
                setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: err })
              }
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
          <div className="w-full flex flex-col gap-y-2 mt-1">
          <div className="flex items-center gap-x-2 sm:justify-between sm:w-full">
            <label className="block w-[75px] shrink-0 font-flow font-bold">Threshold</label>
            <input
              type="number"
              disabled={disabled}
              min="1"
              max={floatEvents.length}
              id="threshold"
              className="grow rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              onChange={(event) => { setThreshold(event.target.value)}}
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