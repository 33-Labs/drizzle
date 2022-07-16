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
import EligilityModeSelector, { EligilityModeWhitelistWitAmount } from './eligibility/EligilityModeSelector'
import FloatPicker, { FloatModeFloat, FloatModeFloatEvent, FloatModeFloatGroup, PickerModeFloat, PickerModeFloatGroup } from './float/FloatPicker'
import PacketSelector from './eligibility/PacketSelector'
import WhitelistWithAmountReviewer from './eligibility/WhitelistWithAmountReviewer'
import FloatReviewer from './eligibility/FLOATReviewer'
import BasicInfoBoard from './creator/BasicInfoBoard'

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

  const [eligilityMode, setEligilityMode] = useState(null)
  const [packetMode, setPacketMode] = useState(null)

  // For WhitelistWithAmountReviewer
  const [whitelistWithAmountReviewerCallback, setWhitelistWithAmountReviewerCallback] = useState(null)

  // For FloatReviewer
  const [floatReviewerCallback, setFloatReviewerCallback] = useState(null)

  // For Packet
  // const [packetCallback, setPacketCallback] = useState(null)

  const checkBasicParams = () => {
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

  const checkEligibilityParams = () => {
    if (eligilityMode.key === "FLOATGroup") {
      return [true, {}]
    }
    if (eligilityMode.key === "FLOAT") {

      return [true, {}]
    }
    if (eligilityMode.key === "WhitelistWithAmount") {
      if (!whitelistWithAmountCallback) {
        return [false, "Please process Recipients & Amounts"]
      }
      if (whitelistWithAmountCallback.invalidRecordsCount > 0) {
        return [false, "There are some invalid records"]
      }
      if (whitelistWithAmountCallback.tokenAmount.cmp(tokenBalance) != -1) {
        return [false, "Insufficient balance"]
      }
      return [true, "valid"]
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

    const [isBasicParamsValid, basicError] = checkBasicParams()
    if (!isBasicParamsValid) {
      setShowBasicNotification(true)
      setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: basicError })
    }

    const [isEligibilityParamsValid, eligibilityError] = checkEligibilityParams()
    if (!isEligibilityParamsValid) {
      setShowBasicNotification(true)
      setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: eligibilityError })
    }

        setShowBasicNotification(false)

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

  const showEligilityModeInputs = (mode) => {
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
      let floatMode = FloatModeFloatEvent
      if (mode.key === "FLOATGroup") {
        floatMode = FloatModeFloatGroup
      }

      return (
        <FloatReviewer 
          user={props.user}
          token={token}
          setToken={setToken}
          tokenBalance={tokenBalance}
          setTokenBalance={setTokenBalance}
          floatMode={floatMode}
          callback={setFloatReviewerCallback}
        />
      )
      // return (
      //   <div className="p-4 sm:p-8 flex flex-col gap-y-10 rounded-3xl
      //     border-4 border-drizzle-green/30 border-dashed">
      //     <div>
      //       <TokenSelector
      //         user={props.user}
      //         className="w-full"
      //         onTokenSelected={setToken}
      //         onBalanceFetched={setTokenBalance}
      //       />
      //     </div>

      //     <PacketSelector mode={packetMode} setMode={setPacketMode} />
      //     <FloatPicker mode={pickerMode} />
      //   </div>
      // )
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
          eligilityMode={eligilityMode}
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
            Eligility
          </label>
          <EligilityModeSelector mode={eligilityMode} setMode={setEligilityMode} />
        </div>

        {showEligilityModeInputs(eligilityMode)}

        {/** create button */}
        <div className="w-full mt-16 flex flex-col gap-y-2 items-center">
          <button
            type="button"
            className={classNames(
              (transactionInProgress || !eligilityMode) ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              "w-full h-[60px] text-xl font-semibold rounded-2xl shadow-sm text-black"
            )}
            disabled={transactionInProgress || !eligilityMode}
            onClick={handleSubmit}
          >
            {props.user.loggedIn ?
              (eligilityMode ? "CREATE" : "Select a mode") : "Connect Wallet"}
          </button>
        </div>
      </div>
    </>
  )
}