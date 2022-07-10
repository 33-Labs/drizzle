import { useState, useEffect } from 'react'
import useSWR from 'swr'

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
  transactionStatusState
} from "../../lib/atoms"
import { classNames, isValidFlowAddress } from "../../lib/utils"
import { getFloatEvent } from '../../lib/float-scripts'
import Decimal from 'decimal.js'
import FloatEventList from './FloatEventList'

const floatEventFetcher = async (funcName, eventHost, eventID) => {
  return await getFloatEvent(eventHost, eventID)
}

export default function FloatPicker(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [rawEventStr, setRawEventStr] = useState('')
  const [floatEvent, setFloatEvent] = useState(null)

  // const { data: eventData, error: eventError } = useSWR(
  //   eventID && eventHost ? ["floatEventFetcher", eventHost, eventID] : null, floatEventFetcher)

  // useEffect(() => {
  //   if (eventData) { setFloatEvent(eventData) }
  // }, [eventData])
  // TODO: Error handling

  const parseRawEvent = (raw) => {
    try {
      const result = raw.replace("#", "").split("@")
      if (result.length != 2) {
        throw "Invalid event pair"
      }

      const [id, host] = result
      if (isValidFlowAddress(host)) {
        setEventHost(host)
      } else {
        throw "Invalid address"
      }

      const _id = new Decimal(id)
      if (_id.isInteger() && _id.isPositive) {
        setEventID(id)
      } else {
        throw "Invalid event id"
      }
    } catch (error) {
      return { type: "exclamation", title: "Invalid Params", detail: error }
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-2xl font-bold font-flow">
        FLOAT Event
      </label>
      <label className="block font-flow text-md leading-6 mt-2 mb-2">
        {`Enter event id and event host, concat them with "@". For instance: 98963710@0x257c27ba4951541d`}
      </label>
      <div className="w-full flex justify-between gap-x-3">
        <input
          type="text"
          name="deposit"
          id="deposit"
          className="bg-drizzle-green/10 grow border-drizzle-green font-flow text-lg rounded-2xl
          focus:ring-drizzle-green-dark focus:border-drizzle-green-dark  placeholder:text-gray-300"
          disabled={transactionInProgress}
          value={rawEventStr}
          placeholder={"98963710@0x257c27ba4951541d"}
          onChange={(event) => {
            setRawEventStr(event.target.value)
          }}
        />
        <button
          type="button"
          className={classNames(
            transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
            `rounded-xl h-12 px-6 text-base font-medium shadow-sm text-black`
          )}
          disabled={transactionInProgress}
          onClick={async () => {
            setShowBasicNotification(false)
            if (rawEventStr) {
              try {
                const result = rawEventStr.replace("#", "").split("@")
                console.log(result)
                console.log(rawEventStr)
                if (result.length != 2) {
                  throw "Invalid event pair"
                }

                const [id, host] = result
                if (!isValidFlowAddress(host)) {
                  throw "Invalid address"
                }

                const _id = new Decimal(id)
                if (!(_id.isInteger() && _id.isPositive())) {
                  throw "Invalid event id"
                }

                const _event = await getFloatEvent(host, id)
                console.log(_event)
                setFloatEvent(_event)
              } catch (error) {
                setShowBasicNotification(true)
                setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: error })
              }
            }
          }}
        >
          Sync
        </button>
      </div>
      {floatEvent ?
        <div className="w-full mt-2">
        <FloatEventList events={[floatEvent]} /> 
        </div>
        : null
        
      }
    </div>
  )
}