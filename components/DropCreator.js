import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { useRouter } from 'next/router'
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
import WhitelistWithAmount from './WhitelistWithAmount'

const NamePlaceholder = "DROP NAME"
const DescriptionPlaceholder = "Detail information about this drop"
const HostPlaceholder = "0x0042"
const TokenPlaceholder = { symbol: "FLOW" }
const AmountPlaceholder = new Decimal(42)
const CreatedAtPlaceholder = new Date('2020-08-01T08:16:16Z')
const URLPlaceholder = "https://the.link.you.want.to.add"
const Timezone = getTimezone()

export default function DropCreator(props) {
  const router = useRouter()
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [transactionStatus, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [banner, setBanner] = useState(null)
  const [bannerSize, setBannerSize] = useState(0)

  const [name, setName] = useState(null)
  const [url, setURL] = useState(null)
  const [description, setDescription] = useState(null)

  const [timeLockEnabled, setTimeLockEnabled] = useState(false)
  const [startAt, setStartAt] = useState(null)
  const [endAt, setEndAt] = useState(null)

  const [token, setToken] = useState(null)
  const [tokenBalance, setTokenBalance] = useState(new Decimal(0))

  // For WhitelistWithAmount
  const [whitelistWithAmountCallback, setWhitelistWithAmountCallback] = useState(null)

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

    // TODO: should be checked only if WhitelistWithAmount be selected
    if (!whitelistWithAmountCallback) {
      return [false, "please process claims"]
    }
    if (whitelistWithAmountCallback.invalidRecordsCount > 0) {
      return [false, "there are some invalid records"]
    }
    if (whitelistWithAmountCallback.tokenAmount.cmp(tokenBalance) != -1) {
      return [false, "insufficient balance"]
    }

    return [true, null]
  }

  const handleSubmit = async (event) => {
    if (props.user && props.user.loggedIn) {
      const [valid, error] = checkParams()
      if (valid) {
        setShowBasicNotification(false)

        const {claims, tokenAmount, } = whitelistWithAmountCallback
        console.log("claims ", claims)
        console.log("tokenAmount ", tokenAmount.toString())
        const _description = description ?? ''
        const _startAt = startAt ? `${startAt.getTime() / 1000}.0` : null
        const _endAt = endAt ? `${endAt.getTime() / 1000}.0` : null
        const tokenProviderPath = token.path.vault.replace("/storage/", "")
        const tokenBalancePath = token.path.balance.replace("/public/", "")
        const tokenReceiverPath = token.path.receiver.replace("/public/", "")
        const _tokenAmount = tokenAmount.toFixed(8).toString()

        console.log(`
          name: ${name}\n
          desc: ${_description}\n
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
          tokenAmount: ${_tokenAmount}\n
          banner: ${banner}
        `)

        const res = await createDrop(
          name, _description, banner, url, claims, _startAt,
          _endAt, token, _tokenAmount, setTransactionInProgress, setTransactionStatus
        )
        
        if (res && res.status === 4 && res.statusCode === 0) {
          const createDropEvent = res.events.find((e) => e.data.dropID)
          if (createDropEvent) {
            router.push(`${props.user && props.user.addr}/drops/${createDropEvent.data.dropID}`)
          }
        }
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
          host={(props.user && props.user.addr) ? props.user.addr : HostPlaceholder}
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

        <div>
          <WhitelistWithAmount 
            token={token} 
            tokenBalance={tokenBalance} 
            callback={setWhitelistWithAmountCallback}
          />
        </div>

        {/** create button */}
        <div className="w-full mt-20 flex flex-col gap-y-2 items-center">
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              "w-full h-[60px] text-xl font-semibold rounded-2xl shadow-sm text-black"
            )}
            disabled={transactionInProgress}
            onClick={handleSubmit}
          >
            {props.user.loggedIn ? "Create" : "Connect Wallet"}
          </button>
        </div>
      </div>
    </>
  )
}