import { useState } from 'react'

import { useRouter } from 'next/router'
import * as fcl from "@onflow/fcl"
import Decimal from 'decimal.js'

import TokenSelector from "./eligibility/TokenSelector"
import ImageSelector from './toolbox/ImageSelector'
import DropCard from './drop/DropCard'

import { createDrop_WhitelistWithAmount } from '../lib/transactions'
import { classNames, filterRecords, getClaimsFromRecords, getTimezone, isValidHttpUrl } from '../lib/utils'

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import CSVSelector from './toolbox/CSVSelector'
import WhitelistWithAmount from './eligibility/WhitelistWithAmountReviewer'
import EligibilityModeSelector, { EligibilityModeWhitelistWitAmount } from './eligibility/EligibilityModeSelector'
import FloatPicker, { FloatModeFloat, FloatModeFloatEvent, FloatModeFloatGroup, PickerModeFloat, PickerModeFloatGroup } from './float/FloatPicker'
import PacketSelector from './eligibility/PacketSelector'
import WhitelistWithAmountReviewer from './eligibility/WhitelistWithAmountReviewer'
import FloatReviewer from './eligibility/FLOATReviewer'
import BasicInfoBoard from './creator/BasicInfoBoard'
import Hints from '../lib/hints'

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

  const [token, setToken] = useState(null)
  const [tokenBalance, setTokenBalance] = useState(new Decimal(0))

  const [timeLockEnabled, setTimeLockEnabled] = useState(false)
  const [startAt, setStartAt] = useState(null)
  const [endAt, setEndAt] = useState(null)

  const [eligibilityMode, setEligibilityMode] = useState(null)

  // For WhitelistWithAmountReviewer
  const [whitelistWithAmountReviewerCallback, setWhitelistWithAmountReviewerCallback] = useState(null)

  // For Float
  // [{eventID: xxx, eventHost: xxx}]
  const [floatEvents, setFloatEvents] = useState([])
  // {groupName: xxx, groupHost: xxx}
  const [floatGroup, setFloatGroup]= useState(null)

  // For Packet
  const [packetMode, setPacketMode] = useState(null)
  const [threshold, setThreshold] = useState('')
  const [capacity, setCapacity] = useState('')
  const [identicalAmount, setIdenticalAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState('')

  // For Packet
  // const [packetCallback, setPacketCallback] = useState(null)

  const checkBasicParams = () => {
    if (!name || name.trim() == "") {
      return [false, Hints.InvalidName]
    }

    if (url && !isValidHttpUrl(url)) {
      return [false, Hints.InvalidURL]
    }

    if (!token) {
      return [false, Hints.InvalidToken]
    }

    if (bannerSize > 500000) {
      return [false, Hints.BannerOversize]
    }

    if (endAt && endAt.getTime() < (new Date()).getTime()) {
      return [false, Hints.DropEnded]
    }

    if (startAt && endAt && startAt.getTime() >= endAt.getTime()) {
      return [false, Hints.InvalidTimeLimit]
    }

    return [true, null]
  }

  const checkEligibilityParams = () => {
    if (eligibilityMode.key === "FLOATGroup") {
      return [true, {}]
    }
    if (eligibilityMode.key === "FLOAT") {

      return [true, {}]
    }
    if (eligibilityMode.key === "WhitelistWithAmount") {
      if (!whitelistWithAmountCallback) {
        return [false, Hints.NeedProcessRA]
      }
      if (whitelistWithAmountCallback.invalidRecordsCount > 0) {
        return [false, Hints.HaveInvalidRecords]
      }
      if (whitelistWithAmountCallback.tokenAmount.cmp(tokenBalance) != -1) {
        return [false, Hints.InsufficientBalance]
      }
      return [true, Hints.Valid]
    }
  }

  const checkPacketParams = () => {
    // if (packetMode)
  }

  const handleSubmit = async (event) => {
    if (!(props.user && props.user.loggedIn)) {
      fcl.authenticate()
      return
    }

    setShowBasicNotification(false)

    const [isBasicParamsValid, basicError] = checkBasicParams()
    if (!isBasicParamsValid) {
      setShowBasicNotification(true)
      setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: basicError })
      return
    }

    const [isEligibilityParamsValid, eligibilityError] = checkEligibilityParams()
    if (!isEligibilityParamsValid) {
      setShowBasicNotification(true)
      setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: eligibilityError })
      return
    }

    // Basic Params
    const _description = description ?? ''
    const _startAt = startAt ? `${startAt.getTime() / 1000}.0` : null
    const _endAt = endAt ? `${endAt.getTime() / 1000}.0` : null
    const tokenProviderPath = token.path.vault.replace("/storage/", "")
    const tokenBalancePath = token.path.balance.replace("/public/", "")
    const tokenReceiverPath = token.path.receiver.replace("/public/", "")
    const _tokenAmount = tokenAmount.toFixed(8).toString()

    const { claims, tokenAmount, } = whitelistWithAmountCallback

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

    const res = await createDrop_WhitelistWithAmount(
      name, _description, banner, url, _startAt,
      _endAt, token, claims, _tokenAmount, setTransactionInProgress, setTransactionStatus
    )

    if (res && res.status === 4 && res.statusCode === 0) {
      const createDropEvent = res.events.find((e) => e.data.dropID)
      if (createDropEvent) {
        router.push(`${props.user && props.user.addr}/drops/${createDropEvent.data.dropID}`)
      }
    }
  }

  const showEligibilityModeInputs = (mode) => {
    if (!mode) { return null }
    if (mode.key == "WhitelistWithAmount") {
      return (
        <WhitelistWithAmountReviewer
          user={props.user}
          token={token}
          setToken={setToken}
          tokenBalance={tokenBalance}
          setTokenBalance={setTokenBalance}
          callback={setWhitelistWithAmountReviewerCallback}
        />
      )
    }

    if (mode.key === "FLOAT" || mode.key === "FLOATGroup") {
      return (
        <FloatReviewer
          user={props.user}
          token={token} setToken={setToken}
          tokenBalance={tokenBalance} setTokenBalance={setTokenBalance}
          packetMode={packetMode} setPacketMode={setPacketMode}
          capacity={capacity} setCapacity={setCapacity}
          identicalAmount={identicalAmount} setIdenticalAmount={setIdenticalAmount}
          totalAmount={totalAmount} setTotalAmount={setTotalAmount}
          floatMode={mode.detail}
          threshold={threshold} setThreshold={setThreshold}
          setFloatEvents={setFloatEvents} setFloatGroup={setFloatGroup}
        />
      )
    }

    return null
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
          name={(!name || name.length == 0) ? NamePlaceholder : name}
          url={url}
          host={(props.user && props.user.addr) ? props.user.addr : HostPlaceholder}
          createdAt={CreatedAtPlaceholder}
          description={description ?? DescriptionPlaceholder}
          token={token || TokenPlaceholder}
          timeLockEnabled={timeLockEnabled}
          startAt={startAt}
          endAt={endAt}
          amount={AmountPlaceholder}
          eligibilityMode={eligibilityMode}
        />
      </div>

      <div className="flex flex-col gap-y-10">
        <BasicInfoBoard
          setBanner={setBanner} setBannerSize={setBannerSize}
          setName={setName} setURL={setURL} setDescription={setDescription}
          timeLockEnabled={timeLockEnabled} setTimeLockEnabled={setTimeLockEnabled}
          setStartAt={setStartAt} setEndAt={setEndAt}
        />

        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Eligibility
          </label>
          <EligibilityModeSelector mode={eligibilityMode} setMode={setEligibilityMode} />
        </div>

        {showEligibilityModeInputs(eligibilityMode)}

        {/** create button */}
        <div className="w-full mt-16 flex flex-col gap-y-2 items-center">
          <button
            type="button"
            className={classNames(
              (transactionInProgress || !eligibilityMode) ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              "w-full h-[60px] text-xl font-semibold rounded-2xl shadow-sm text-black"
            )}
            disabled={transactionInProgress || !eligibilityMode}
            onClick={handleSubmit}
          >
            {props.user.loggedIn ?
              (eligibilityMode ? "CREATE" : "Select a mode") : "Connect Wallet"}
          </button>
        </div>
      </div>
    </>
  )
}