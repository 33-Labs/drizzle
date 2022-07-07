import { useState } from 'react'

import { Switch } from '@headlessui/react'
import * as fcl from "@onflow/fcl"

import TokenSelector from "./TokenSelector"
import ImageSelector from './ImageSelector'
import DropCard from './DropCard'
import Decimal from 'decimal.js'
import { createDrop } from '../lib/transactions'
import utils from '../lib/utils'

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Pending = 'Pending'
const Sealed = 'Sealed'
const ExecutionFailed = 'Execution Failed'
const Rejected = 'Transaction Rejected'
const TransactionStatus = {
  Pending,
  Sealed,
  ExecutionFailed,
  Rejected
}

function isValidHttpUrl(string) {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === "http:" || url.protocol === "https:"
}

const getClaimsFromRecords = (records) => {
  let claims = []
  let amount = new Decimal(0)
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const claim = {
      key: record.address,
      value: record.amount.toFixed(8).toString()
    }
    claims.push(claim)
    amount = amount.add(record.amount)
  }

  return [claims, amount.toFixed(8).toString()]
}

const filterRecords = (rawRecordsStr) => {
  const rawRecords = rawRecordsStr.trim().split("\n").filter((r) => r != '')

  let addresses = {}
  let records = []
  let invalidRecords = []
  for (var i = 0; i < rawRecords.length; i++) {
    let rawRecord = rawRecords[i]
    try {
      const [address, rawAmount] = rawRecord.split(",")
      const amount = new Decimal(rawAmount)
      if (!amount.isPositive() || amount.decimalPlaces() > 8) { throw "invalid amount" }
      if (!address.startsWith("0x") || address.length != 18) { throw "invalid address" }

      const bytes = Buffer.from(address.replace("0x", ""), "hex")
      if (bytes.length != 8) { throw "invalid address" }
      if (addresses[address]) { throw "duplicate address" }
      addresses[address] = true
      records.push({ id: i, address: address, amount: amount, rawRecord: rawRecord })
    } catch (e) {
      invalidRecords.push(rawRecord)
    }
  }
  return [records, invalidRecords]
}

export default function DropNCreator(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)


  const timezone = utils.getTimezone()

  const [timeLockEnabled, setTimeLockEnabled] = useState(false)
  const [startAt, setStartAt] = useState(null)
  const [endAt, setEndAt] = useState(null)

  const namePlaceholder = "The name of this drop"
  const [name, setName] = useState(null)
  const descPlaceholder = "Detail information about this drop"
  const [desc, setDesc] = useState("")
  const [url, setURL] = useState(null)
  const [token, setToken] = useState(null)

  const [banner, setBanner] = useState(null)
  const [bannerSize, setBannerSize] = useState(0)

  const [rawRecordsStr, setRawRecordsStr] = useState('')
  const [validRecords, setValidRecords] = useState([])
  const [invalidRecords, setInvalidRecords] = useState([])
  const [recordsSum, setRecordsSum] = useState(new Decimal(0))

  const [tokenBalance, setTokenBalance] = useState(new Decimal(0))

  const [processed, setProcessed] = useState(false)

  const [txid, setTxid] = useState(null)
  const [txStatus, setTxStatus] = useState(null)

  const checkParams = () => {
    if (!name || name.trim() == "") {
      return [false, "invalid name"]
    }

    if (url && !isValidHttpUrl(url)) {
      return [false, "invalid url"]
    }

    if (!token) {
      return [false, "invalid token"]
    }

    if (bannerSize > 500000) {
      return [false, "banner oversize"]
    }

    if (endAt && endAt.getTime() < (new Date()).getTime()) {
      return [false, "drop ended"]
    }

    if (startAt && endAt && startAt.getTime() >= endAt.getTime()) {
      return [false, "start time should be less than end time"]
    }

    if (!processed) {
      return [false, "please process recipients & amounts"]
    }

    if (invalidRecords.length > 0) {
      return [false, "there are some invalid records"]
    }

    return [true, null]
  }

  const handleSubmit = async (event) => {
    if (props.user && props.user.loggedIn) {
      const [valid, error] = checkParams()
      if (valid) {
        setShowBasicNotification(false)

        const [claims, tokenAmount] = getClaimsFromRecords(validRecords)
        const _startAt = startAt ? `${startAt.getTime() / 1000}.0` : null 
        const _endAt = endAt ? `${endAt.getTime() / 1000}.0` : null
        const tokenProviderPath = token.path.vault.replace("/storage/", "")
        const tokenBalancePath = token.path.balance.replace("/public/", "")
        const tokenReceiverPath = token.path.receiver.replace("/public/", "")

        console.log(`
          name: ${name}\n
          desc: ${desc ?? ''}\n
          url: ${url}\n
          claims: ${claims}\n
          startAt: ${_startAt}\n
          endAt: ${_endAt}\n
          tokenAddress: ${token.address}\n
          contractName: ${token.contractName}\n
          symbol: ${token.symbol}\n
          tokenProviderPath: ${tokenProviderPath}\n
          tokenBalancePath: ${tokenBalancePath}\n
          tokenReceiverPath: ${tokenReceiverPath}\n
          tokenAmount: ${tokenAmount}\n
          banner: ${banner}
        `)

        await createDrop(
          name, desc ?? '', banner, url, claims, _startAt,
          _endAt, token, tokenAmount, setTransactionInProgress, setTransactionStatus
        )
      }
    } else {
      fcl.authenticate()
    }
  }

  return (
    <>
      {/** title */}
      <h1 className="font-flow font-semibold text-4xl text-center mb-10">
        Create Drop
      </h1>

      {/** preview */}
      <div className="flex justify-center mb-10">
        <DropCard
          name={name ? name : namePlaceholder}
          host={props.user.loggedIn ? props.user.addr : "unknown"}
          createdAt={`12/17/2022, 05:20:00 AM`}
          description={desc ? desc : descPlaceholder}
          amount={1024.2048}
          tokenSymbol={token ? token.symbol : "FLOW"}
          isPreview={true}
          banner={banner}
          url={url}
          startAt={startAt}
          endAt={endAt}
          timeLockEnabled={timeLockEnabled}
          timezone={timezone}
        />
      </div>

      <div className="flex flex-col gap-y-10">

        {/** image uploader */}
        <div className="flex flex-col gap-y-1">
          <label className="block text-2xl font-bold font-flow">
            {"banner"}
          </label>
          <label className="block text-md font-flow leading-8 mt-2">image size should be less than 500 KB</label>
          <ImageSelector imageSelectedCallback={(_banner, _bannerSize) => {
            setBanner(_banner)
            setBannerSize(_bannerSize)
          }} />
        </div>

        {/** name */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder="the name of this drop"
              onChange={(event) => {
                setName(event.target.value)
              }}
            />
          </div>
        </div>


        {/** description */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            description
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="description"
              id="description"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"

              defaultValue={''}
              spellCheck={false}
              placeholder={
                "detail information about this drop"
              }
              onChange={(event) => {
                setDesc(event.target.value)
              }}
            />
          </div>
        </div>

        {/** url */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            url
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="url"
              id="url"
              pattern="[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder="the link about this drop"
              onChange={(event) => {
                setURL(event.target.value)
              }}
            />
          </div>
        </div>


        {/** token selector */}
        <div>
          <TokenSelector
            user={props.user}
            className="w-full"
            onTokenSelected={setToken}
            onBalanceFetched={setTokenBalance}
          />
        </div>

        {/** time limit */}
        <div>
          <div className="flex justify-between mb-4">
            <label className="block text-2xl font-bold font-flow">
              time limit{` (${timezone})`}
            </label>
            <Switch
              checked={timeLockEnabled}
              onChange={setTimeLockEnabled}
              className={classNames(
                timeLockEnabled ? 'bg-drizzle-green' : 'bg-gray-200',
                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle-green'
              )}
            >
              <span className="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                className={classNames(
                  timeLockEnabled ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                )}
              />
            </Switch>
          </div>

          {timeLockEnabled ?
            <div className="flex justify-between gap-x-2 gap-y-2 flex-wrap">
              <div className="flex items-center gap-x-2">
                <label className="inline-block w-12 font-flow font-bold">start</label>
                <input
                  type="datetime-local"
                  id="start_at"
                  className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
                  onChange={(e) => { setStartAt(new Date(e.target.value)) }}
                />
              </div>

              <div className="flex items-center gap-x-2">
                <label className="inline-block w-12 font-flow font-bold">end</label>
                <input
                  type="datetime-local"
                  id="end_at"
                  className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
                  onChange={(e) => { setEndAt(new Date(e.target.value)) }}
                />
              </div>
            </div> : null}
        </div>


        {/** recipients & amounts */}
        <div>
          <label className="block text-2xl font-bold font-flow">
            recipients & amounts
          </label>
          <label className="block font-flow text-md leading-8 mt-2">
            For each line, enter one address and the token amount, seperate with comma. Duplicate addresses is not allowed.
          </label>
          <div className="mt-1">
            <textarea
              rows={8}
              name="recipients"
              id="recipients"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              spellCheck={false}
              value={rawRecordsStr}
              placeholder={
                "0xf8d6e0586b0a20c7,1.6"
              }
              onChange={(event) => { setRawRecordsStr(event.target.value) }}
            />
            <div className="flex mt-4 gap-x-2 justify-between">
              <div className="h-12 w-40 font-medium text-base shadow-sm bg-drizzle-green hover:bg-drizzle-green-dark">
                <label htmlFor="csv_uploader" className="w-full inline-block text-center leading-[48px] ">upload csv</label>
                <input id="csv_uploader" className="invisible" type="file"
                  accept=".csv"
                  onChange={(event) => {
                    setProcessed(false)
                    const f = event.target.files[0]
                    const reader = new FileReader()
                    reader.addEventListener('load', (e) => {
                      const data = e.target.result
                      setRawRecordsStr(data)
                      event.target.value = null
                    })
                    reader.readAsText(f)
                  }}
                />
              </div>
              <button
                type="button"
                className="h-12 w-40 px-6 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
                onClick={() => {
                  if (token) {
                    const [validRecords, invalidRecords] = filterRecords(rawRecordsStr.trim())
                    setValidRecords(validRecords)
                    setInvalidRecords(invalidRecords)
                    setRecordsSum(validRecords.map((r) => r.amount).reduce((p, c) => p.add(c), new Decimal(0)))
                    setProcessed(true)
                  } else {
                    setShowBasicNotification(true)
                    setBasicNotificationContent({type: "exclamation", title: "Invalid Params", detail: "Token is not selected"})
                  }
                }}
              >
                process
              </button>
            </div>
          </div>
        </div>

        {
          validRecords.length > 0 || invalidRecords.length > 0 ? (
            <div>
              <label className="block text-2xl font-bold font-flow">
                summary
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
                  <li key="total">
                    <div className="flex items-center">
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        Total Token
                      </div>
                      <div className="grow"></div>
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        {recordsSum.toString()} {token && token.symbol}
                      </div>
                    </div>
                  </li>
                  <li key="balance">
                    <div className="flex items-center">
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        Your Balance
                      </div>
                      <div className="grow"></div>
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        {tokenBalance.toString()} {token && token.symbol}
                      </div>
                    </div>
                  </li>
                  <li key="remaining">
                    <div className="flex items-center">
                      <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                        Remaining
                      </div>
                      <div className="grow"></div>
                      {
                        !(tokenBalance.sub(recordsSum).isNegative())
                          ? <div className="flex-none w-30 text-md font-flow font-semibold leading-10">
                            {tokenBalance.sub(recordsSum).toString()} {token && token.symbol}
                          </div>
                          : <div className="flex-none w-30 text-md text-rose-500 font-flow font-semibold leading-10">
                            {tokenBalance.sub(recordsSum).toString()} {token && token.symbol}
                          </div>
                      }
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
                invalid records
              </label>
              <label className="block font-flow text-md leading-8 mt-2">
                invalid format or invalid amount or duplicate accounts
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

        {/** create button */}
        <div className="w-full mt-20 flex flex-col gap-y-2 items-center">
          <button
            type="button"
            className="w-full h-12 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            onClick={handleSubmit}
          >
            {props.user.loggedIn ? "create" : "connect wallet"}
          </button>
        </div>
      </div>
    </>
  )
}