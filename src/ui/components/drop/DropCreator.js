import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import * as fcl from "@onflow/fcl"
import Decimal from 'decimal.js'

import TokenSelector from './TokenSelector'
import PacketSelector from './PacketSelector'
import DropCard from './DropCard'

import {
  createDrop
} from '../../lib/cloud-transactions'
import { classNames, floatEventInputHandler, floatGroupInputHandler, isValidHttpUrl } from '../../lib/utils'

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
  transactionStatusState
} from "../../lib/atoms"
import EligibilityModeSelector, {
  EligibilityModeFLOAT,
  EligibilityModeFLOATGroup,
  EligibilityModeWhitelistWitAmount,
  EligibilityModeWhitelist
} from '../eligibility/EligibilityModeSelector'
import WhitelistWithAmountReviewer from '../eligibility/WhitelistWithAmountReviewer'
import FloatReviewer from '../eligibility/FloatReviewer'
import BasicInfoBoard from '../common/BasicInfoBoard'
import Hints from '../../lib/hints'
import { PacketModeIdentical, PacketModeRandom } from './PacketModeSelector'
import WhitelistReviewer from '../eligibility/WhitelistReviewer'
import CreatedModal from '../common/CreatedModal'
import publicConfig from '../../publicConfig'
import StatsCard from './StatsCard'

const NamePlaceholder = "DROP NAME"
const DescriptionPlaceholder = "Detailed information about this DROP"
const HostPlaceholder = "0x0042"
const TokenPlaceholder = { symbol: "FLOW" }
const AmountPlaceholder = new Decimal(42)
const CreatedAtPlaceholder = new Date('2020-08-01T08:16:16Z')

export default function DropCreator(props) {
  const router = useRouter()
  const { float, float_group } = router.query

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

  const [withDistributorSelector, setWithDistributorSelector] = useState(false)

  // For WhitelistWithAmountReviewer
  const [whitelistWithAmountReviewerCallback, setWhitelistWithAmountReviewerCallback] = useState(null)

  // For Whitelist
  const [whitelistReviewerCallback, setWhitelistReviewerCallback] = useState(null)

  // For Float
  const [floatEvents, setFloatEvents] = useState([])
  // [{eventID: xxx, eventHost: xxx}]
  const [floatEventPairs, setFloatEventPairs] = useState([])
  // {groupName: xxx, groupHost: xxx}
  const [floatGroup, setFloatGroup] = useState(null)
  const [threshold, setThreshold] = useState('')

  // For Packet
  const [packetMode, setPacketMode] = useState(null)
  const [capacity, setCapacity] = useState('')

  // For Identical
  const [identicalAmount, setIdenticalAmount] = useState('')
  // For Random
  const [totalAmount, setTotalAmount] = useState('')

  const [showPreview, setShowPreview] = useState(false)

  const [showCreatedModal, setShowCreatedModal] = useState(false)
  const [newDropURL, setNewDropURL] = useState(null)

  useEffect(() => {
    if (!eligibilityMode) {
      setWithDistributorSelector(false)
      return
    }
    if (eligibilityMode.key == EligibilityModeWhitelistWitAmount.key) {
      setWithDistributorSelector(false)
    } else {
      setWithDistributorSelector(true)
    }
  }, [eligibilityMode])

  // For url query fast creation
  // TODO: need to should EventList?
  useEffect(() => {
    if (float && float.trim() != '') {
      floatEventInputHandler(float).then((eventPairs) => {
        setFloatEventPairs(eventPairs)
        setEligibilityMode(EligibilityModeFLOAT)
      }).catch(console.error)
    }

    if (float_group && float_group.trim() != '') {
      floatGroupInputHandler(float_group).then((group) => {
        setFloatGroup(group)
        setEligibilityMode(EligibilityModeFLOATGroup)
      })
    }
  }, [float, float_group])

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

    if (bannerSize > publicConfig.bannerSizeLimit) {
      return [false, Hints.BannerOversize]
    }

    if (endAt && isFinite(endAt)) {
      if (endAt.getTime() < (new Date()).getTime()) {
        return [false, Hints.DropEnded]
      }
    }

    if (startAt && endAt && isFinite(startAt) && isFinite(endAt)) {
      if (startAt.getTime() >= endAt.getTime()) {
        return [false, Hints.InvalidTimeLimit]
      }
    }

    return [true, null]
  }

  const checkEligibilityParams = () => {
    if (eligibilityMode.key === EligibilityModeFLOAT.key) {
      return EligibilityModeFLOAT.checkParams(
        floatEvents, threshold,
        packetMode, tokenBalance, capacity,
        { identicalAmount: identicalAmount, totalAmount: totalAmount }
      )
    }

    if (eligibilityMode.key === EligibilityModeWhitelistWitAmount.key) {
      return EligibilityModeWhitelistWitAmount.checkParams(whitelistWithAmountReviewerCallback, tokenBalance)
    }

    if (eligibilityMode.key === EligibilityModeWhitelist.key) {
      return EligibilityModeWhitelist.checkParams(
        whitelistReviewerCallback,
        packetMode, tokenBalance, capacity,
        { identicalAmount: identicalAmount, totalAmount: totalAmount }
      )
    }
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

    if (!showPreview) {
      setShowPreview(true)
      return
    }

    const params = {
      name: name,
      description: description ?? '',
      image: banner,
      url: url,
      startAt: startAt && isFinite(startAt) ? `${startAt.getTime() / 1000}.0` : null,
      endAt: endAt && isFinite(endAt) ? `${endAt.getTime() / 1000}.0` : null,
      token: token,
      withExclusiveWhitelist: false,
      exclusiveWhitelist: [],
      whitelistTokenAmount: null,
      withWhitelist: false,
      whitelist: [],
      withIdenticalDistributor: false,
      capacity: null,
      amountPerEntry: null,
      withRandomDistributor: false,
      totalRandomAmount: null,
      withFloats: false,
      threshold: null,
      eventIDs: [],
      eventHosts: []
    }

    if (eligibilityMode.key === EligibilityModeWhitelistWitAmount.key) {
      const { whitelist, tokenAmount, } = whitelistWithAmountReviewerCallback
      const _tokenAmount = tokenAmount.toFixed(8).toString()
      params.withExclusiveWhitelist = true
      params.exclusiveWhitelist = whitelist
      params.whitelistTokenAmount = _tokenAmount

    } else if (eligibilityMode.key === EligibilityModeWhitelist.key) {
      const { whitelist, } = whitelistReviewerCallback
      params.withWhitelist = true
      params.whitelist = whitelist

    } else if (eligibilityMode.key === EligibilityModeFLOAT.key) {
      // Only support 1 event now
      let eventIDs = [floatEventPairs[0].eventID]
      let eventHosts = [floatEventPairs[0].eventHost]

      params.withFloats = true
      params.threshold = `${eventIDs.length}`
      params.eventIDs = eventIDs
      params.eventHosts = eventHosts

    }

    if (packetMode && packetMode.key === PacketModeIdentical.key) {
      let _identicalAmount = new Decimal(identicalAmount).toFixed(8).toString()
      params.withIdenticalDistributor = true
      params.capacity = capacity
      params.amountPerEntry = _identicalAmount

    } else if (packetMode && packetMode.key === PacketModeRandom.key) {
      let totalRandomAmount = new Decimal(totalAmount).toFixed(8).toString()
      params.withRandomDistributor = true
      params.capacity = capacity
      params.totalRandomAmount = totalRandomAmount
    }

    const args = Object.values(params)
    const res = await createDrop(...args,
      setTransactionInProgress, setTransactionStatus
    )
    handleCreationResponse(res)
  }

  const handleCreationResponse = (res) => {
    if (res && res.status === 4 && res.statusCode === 0) {
      const createDropEvent = res.events.find((e) => e.data.dropID)
      if (createDropEvent) {
        const url = `${publicConfig.appURL}/${props.user && props.user.addr}/drops/${createDropEvent.data.dropID}`
        setNewDropURL(url)
        setShowCreatedModal(true)
      }
    }
  }

  const showEligibilityModeInputs = (mode) => {
    if (!mode) { return null }
    if (mode.key == EligibilityModeWhitelistWitAmount.key) {
      return (
        <WhitelistWithAmountReviewer
          token={token}
          tokenBalance={tokenBalance}
          callback={setWhitelistWithAmountReviewerCallback}
        />
      )
    }

    if (mode.key === EligibilityModeWhitelist.key) {
      return (
        <WhitelistReviewer
          callback={setWhitelistReviewerCallback}
        />
      )
    }

    if (mode.key === EligibilityModeFLOAT.key) {
      return (
        <FloatReviewer
          floatMode={mode.detail}
          threshold={threshold} setThreshold={setThreshold}
          rawFloatInput={float || float_group}
          floatEvents={floatEvents}
          setFloatEvents={setFloatEvents}
          setFloatEventPairs={setFloatEventPairs}
          setFloatGroup={setFloatGroup}
        />
      )
    }

    return null
  }

  return (
    <>
      {/** title */}
      {showPreview ?
        <h1 className="font-flow font-semibold text-2xl sm:text-4xl text-center mb-10">
          PREVIEW
        </h1> :
        <h1 className="font-flow font-semibold text-2xl sm:text-4xl text-center mb-10">
          CREATE DROP
        </h1>
      }

      {/** preview */}
      {showPreview ?
      <>
        <div className="flex justify-center mb-10">
          <DropCard
            isPreview={true}
            banner={banner}
            name={(!name || name.length == 0) ? NamePlaceholder : name}
            url={url}
            host={props.user.addr || HostPlaceholder}
            createdAt={CreatedAtPlaceholder}
            description={description ?? DescriptionPlaceholder}
            token={token || TokenPlaceholder}
            timeLockEnabled={timeLockEnabled}
            startAt={startAt}
            endAt={endAt}
            amount={AmountPlaceholder}
            eligibilityMode={eligibilityMode}
            packetMode={packetMode}
            floatGroup={floatGroup}
            floatEventPairs = {floatEventPairs}
            threshold={threshold}
          />
        </div> 
        <div className="flex flex-col items-center justify-center">
          <StatsCard isPreview={true} token={token} 
            packetMode={packetMode} 
            randomTotalAmount={totalAmount}
            identicalAmount={identicalAmount} 
            totalTokenAmount={whitelistWithAmountReviewerCallback && whitelistWithAmountReviewerCallback.tokenAmount}
            capacity={capacity}
          />
        </div>
        </>
        : null
      }

      <div className={`${showPreview ? 'hidden' : ''} flex flex-col gap-y-10 shadow-drizzle p-4 sm:p-8 rounded-3xl bg-white`}>
        <BasicInfoBoard
          banner={banner} setBanner={setBanner} setBannerSize={setBannerSize}
          setName={setName} setURL={setURL} setDescription={setDescription}
          timeLockEnabled={timeLockEnabled} setTimeLockEnabled={setTimeLockEnabled}
          setStartAt={setStartAt} setEndAt={setEndAt}
          NamePlaceholder={NamePlaceholder} DescriptionPlaceholder={DescriptionPlaceholder}
          withTimeLimitPicker={true}
        />

        <TokenSelector
          user={props.user}
          className="w-full"
          onTokenSelected={setToken}
          onBalanceFetched={setTokenBalance}
        />

        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Eligibility<span className="text-red-600">*</span>
          </label>
          <EligibilityModeSelector mode={eligibilityMode} setMode={setEligibilityMode} setPacketMode={setPacketMode} />
        </div>

        {showEligibilityModeInputs(eligibilityMode)}

        {withDistributorSelector ?
          <PacketSelector
            mode={packetMode} setMode={setPacketMode}
            capacity={capacity} setCapacity={setCapacity}
            identicalAmount={identicalAmount} setIdenticalAmount={setIdenticalAmount}
            totalAmount={totalAmount} setTotalAmount={setTotalAmount}
          /> : null
        }
      </div>

      {/** create button */}
      <div className="w-full mt-16 flex flex-col gap-y-5 sm:flex-row sm:justify-between sm:gap-x-10 items-center">
        {showPreview ?
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              "w-full h-[60px] text-xl font-semibold rounded-3xl text-black shadow-drizzle"
            )}
            disabled={transactionInProgress}
            onClick={() => {
              setShowPreview(false)
            }}
          >
            BACK
          </button> : null
        }
        <button
          type="button"
          className={classNames(
            (transactionInProgress || !eligibilityMode) ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
            "w-full h-[60px] text-xl font-semibold rounded-3xl text-black shadow-drizzle"
          )}
          disabled={transactionInProgress || !eligibilityMode}
          onClick={() => {
            handleSubmit()
          }}
        >
          {props.user.loggedIn ?
            (eligibilityMode ?
              (!showPreview ? "PREVIEW" : "CREATE")
              : "Select a mode") : "Connect Wallet"}
        </button>
      </div>
      <CreatedModal open={showCreatedModal} setOpen={setShowCreatedModal} url={newDropURL} />
    </>
  )
}