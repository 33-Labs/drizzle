import { useState } from 'react'
import { useRecoilState } from "recoil"

import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
} from "../../lib/atoms"
import CSVSelector from '../common/CSVSelector'
import { classNames, filterAddresses, getWhitelistFromAddresses } from '../../lib/utils'

export default function WhitelistInput(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress] = useRecoilState(transactionInProgressState)

  const { callback } = props

  const [rawRecordsStr, setRawRecordsStr] = useState('')
  const [validRecords, setValidRecords] = useState([])
  const [invalidRecords, setInvalidRecords] = useState([])

  return (
    <>
      <div>
        <label className="block text-2xl font-bold font-flow">
          Addresses
        </label>
        <label className="block font-flow text-md leading-6 mt-2 mb-2">
          For each line, enter one address. Duplicate addresses are not allowed.
        </label>
        <div className="mt-1">
          <textarea
            rows={8}
            name="recipients"
            id="recipients"
            className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark rounded-2xl
        bg-drizzle-green-ultralight resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
            spellCheck={false}
            value={rawRecordsStr}
            placeholder={
              "0xf8d6e0586b0a20c7"
            }
            onChange={(event) => {
              if (validRecords.length > 0 || invalidRecords.length > 0) {
                setValidRecords([])
                setInvalidRecords([])
              }
              setRawRecordsStr(event.target.value)
            }}
          />
          <div className="flex mt-4 gap-x-2 justify-between">
            <button
              type="button"
              className={classNames(
                transactionInProgress ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
                "h-12 w-40 px-6 text-base rounded-2xl font-medium shadow-md text-black"
              )}
              disabled={transactionInProgress}
              onClick={() => {
                if (rawRecordsStr.trim().length == 0) {
                  setShowBasicNotification(true)
                  setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: "NO addresses provided" })
                  return
                }

                const [valids, invalids] = filterAddresses(rawRecordsStr.trim())
                setValidRecords(valids)
                setInvalidRecords(invalids)
                const whitelist = getWhitelistFromAddresses(valids)
                callback({
                  whitelist: whitelist,
                  invalidRecordsCount: invalids.length
                })
              }}
            >
              Process
            </button>
            <CSVSelector
              sample={"r_sample.csv"}
              onChange={(event) => {
                callback(null)
                const f = event.target.files[0]
                const reader = new FileReader()
                reader.addEventListener('load', (e) => {
                  const data = e.target.result
                  setRawRecordsStr(data)
                  event.target.value = null
                })
                reader.readAsText(f)
              }
              } />
          </div>
        </div>
      </div>

      {
        validRecords.length > 0 || invalidRecords.length > 0 ? (
          <div>
            <label className="block text-2xl font-bold font-flow">
              Summary
            </label>
            <div className="mt-1 mb-30">
              <ul role="list">
                <li key="valid count">
                  <div className="flex items-center">
                    <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                      # of Valid Records
                    </div>
                    <div className="grow"></div>
                    <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                      {validRecords.length}
                    </div>
                  </div>
                </li>
                <li key="invalid count">
                  <div className="flex items-center">
                    <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                      # of Invalid Records
                    </div>
                    <div className="grow"></div>
                    <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                      {invalidRecords.length}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        ) : null
      }

      {
        invalidRecords.length > 0 && (
          <div>
            <label className="block text-2xl font-bold font-flow">
              Invalid records
            </label>
            <label className="block font-flow text-md leading-8 mt-2">
              Invalid format or duplicate accounts
            </label>
            <div className="mt-1">
              <textarea
                rows={invalidRecords.length > 8 ? 8 : invalidRecords.length}
                name="invalid"
                id="invalid"
                className="focus:ring-rose-700 focus:border-rose-700 bg-rose-300/10 resize-none block w-full border-rose-700 font-flow text-lg placeholder:text-gray-300"
                disabled={true}
                value={(invalidRecords.reduce((p, c) => { return `${p}\n${c}` }, '')).trim()}
                spellCheck={false}
              />
            </div>
          </div>
        )
      }
    </>
  )
}