import { useState } from 'react'
import { Switch } from '@headlessui/react'
import * as fcl from "@onflow/fcl"
import Decimal from 'decimal.js'

import TokenSelector from "./TokenSelector"
import ImageSelector from './ImageSelector'
import DropCard from './DropCard'

import { createDrop } from '../lib/transactions'
import { classNames, filterRecords, getClaimsFromRecords, getTimezone, isValidHttpUrl } from '../lib/utils'

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import CSVSelector from './CSVSelector'

const NamePlaceholder = "DROP NAME"
const DescriptionPlaceholder = "Detail information about this drop"
const HostPlaceholder = "0x0001"
const TokenPlaceholder = { symbol: "FLOW" }
const AmountPlaceholder = new Decimal(42)
const CreatedAtPlaceholder = new Date('2020-08-01T08:16:16Z')
const URLPlaceholder = "https://the.link.you.want.to.add"
const Timezone = getTimezone()

export default function DropNCreator(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [banner, setBanner] = useState(null)
  const [bannerSize, setBannerSize] = useState(0)

  const [name, setName] = useState(null)
  const [url, setURL] = useState(null)
  const [description, setDescription] = useState(null)

  const [timeLockEnabled, setTimeLockEnabled] = useState(false)
  const [startAt, setStartAt] = useState(null)
  const [endAt, setEndAt] = useState(null)

  const [token, setToken] = useState(null)

  const [rawRecordsStr, setRawRecordsStr] = useState('')
  const [validRecords, setValidRecords] = useState([])
  const [invalidRecords, setInvalidRecords] = useState([])
  const [recordsSum, setRecordsSum] = useState(new Decimal(0))
  const [tokenBalance, setTokenBalance] = useState(new Decimal(0))

  const [processed, setProcessed] = useState(false)

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
      } else {
        setShowBasicNotification(true)
        setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: error })
      }
    } else {
      fcl.authenticate()
    }
  }

  return (
    <>
      {/** title */}
      <h1 className="font-flow font-semibold text-4xl text-center mb-10">
        Create DROP
      </h1>

      {/** preview */}
      <div className="flex justify-center mb-10">
        <DropCard
          isPreview={true}
          banner={banner}
          name={name ?? NamePlaceholder}
          url={url}
          host={props.user ? props.user.addr : HostPlaceholder}
          createdAt={CreatedAtPlaceholder}
          description={description ?? DescriptionPlaceholder}
          token={token || TokenPlaceholder}
          timeLockEnabled={timeLockEnabled}
          startAt={startAt}
          endAt={endAt}
          amount={AmountPlaceholder}
        />
      </div>

      <div className="flex flex-col gap-y-10">
        {/** image uploader */}
        <div className="flex flex-col gap-y-1">
          <label className="block text-2xl font-bold font-flow">
            Banner
          </label>
          <label className="block text-md font-flow leading-6 mt-2 mb-2">Image size should be less than 500 KB</label>
          <ImageSelector imageSelectedCallback={(_banner, _bannerSize) => {
            setBanner(_banner)
            setBannerSize(_bannerSize)
          }} />
        </div>

        {/** name */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg rounded-2xl
                focus:ring-drizzle-green-dark focus:border-drizzle-green-dark  placeholder:text-gray-300"
              placeholder={NamePlaceholder}
              onChange={(event) => {
                setName(event.target.value)
              }}
            />
          </div>
        </div>

        {/** description */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Description
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="description"
              id="description"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark rounded-2xl
                bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"

              defaultValue={''}
              spellCheck={false}
              placeholder={DescriptionPlaceholder}
              onChange={(event) => { setDescription(event.target.value) }}
            />
          </div>
        </div>

        {/** url */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            URL
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="url"
              id="url"
              pattern="[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark rounded-2xl
              bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder={URLPlaceholder}
              onChange={(event) => { setURL(event.target.value) }}
            />
          </div>
        </div>

        {/** time limit */}
        <div>
          <div className="flex justify-between mb-4">
            <label className="block text-2xl font-bold font-flow">
              Time Limit{` (${Timezone})`}
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
                <label className="inline-block w-12 font-flow font-bold">Start</label>
                <input
                  type="datetime-local"
                  id="start_at"
                  className="rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
                  onChange={(e) => { setStartAt(new Date(e.target.value)) }}
                />
              </div>

              <div className="flex items-center gap-x-2">
                <label className="inline-block w-12 font-flow font-bold">End</label>
                <input
                  type="datetime-local"
                  id="end_at"
                  className="rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
                  onChange={(e) => { setEndAt(new Date(e.target.value)) }}
                />
              </div>
            </div> : null}
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

        {/** recipients & amounts */}
        <div>
          <label className="block text-2xl font-bold font-flow">
            Recipients & Amounts
          </label>
          <label className="block font-flow text-md leading-6 mt-2 mb-2">
            For each line, enter one address and the token amount, seperate with comma. Duplicate addresses is not allowed.
          </label>
          <div className="mt-1">
            <textarea
              rows={8}
              name="recipients"
              id="recipients"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark rounded-2xl
              bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              spellCheck={false}
              value={rawRecordsStr}
              placeholder={
                "0xf8d6e0586b0a20c7,1.6"
              }
              onChange={(event) => { setRawRecordsStr(event.target.value) }}
            />
            <div className="flex mt-4 gap-x-2 justify-between">
              <button
                type="button"
                className="h-12 w-40 px-6 text-base rounded-2xl font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
                onClick={() => {
                  if (token) {
                    const [validRecords, invalidRecords] = filterRecords(rawRecordsStr.trim())
                    setValidRecords(validRecords)
                    setInvalidRecords(invalidRecords)
                    setRecordsSum(validRecords.map((r) => r.amount).reduce((p, c) => p.add(c), new Decimal(0)))
                    setProcessed(true)
                  } else {
                    setShowBasicNotification(true)
                    setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: "Token is not selected" })
                  }
                }}
              >
                Process
              </button>
              <CSVSelector
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
                Invalid records
              </label>
              <label className="block font-flow text-md leading-8 mt-2">
                Invalid format or invalid amount or duplicate accounts
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
            className="w-full h-[60px] text-xl font-semibold rounded-2xl shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            onClick={handleSubmit}
          >
            {props.user.loggedIn ? "Create" : "Connect Wallet"}
          </button>
        </div>
      </div>
    </>
  )
}