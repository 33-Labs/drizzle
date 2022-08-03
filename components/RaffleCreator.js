import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import * as fcl from "@onflow/fcl"
import Decimal from 'decimal.js'

import DropCard from './drop/DropCard'

import {
  createDrop
} from '../lib/cloud-transactions'
import { classNames, floatEventInputHandler, floatGroupInputHandler, getTimezone, isValidHttpUrl } from '../lib/utils'

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import EligibilityModeSelector, {
  EligibilityModeFLOAT,
  EligibilityModeFLOATGroup,
  EligibilityModeWhitelistWitAmount,
  EligibilityModeWhitelist
} from './eligibility/EligibilityModeSelector'
import FloatReviewer from './eligibility/FloatReviewer'
import BasicInfoBoard from './creator/BasicInfoBoard'
import Hints from '../lib/hints'
import { PacketModeIdentical, PacketModeRandom } from './eligibility/PacketModeSelector'
import WhitelistReviewer from './eligibility/WhitelistReviewer'
import DropCreatedModal from './creator/DropCreatedModal'
import publicConfig from '../publicConfig'
import StatsCard from './presenter/StatsCard'
import NFTSelector from './NFTSelector'

const NamePlaceholder = "RAFFLE NAME"
const DescriptionPlaceholder = "Detailed information about this RAFFLE"
const HostPlaceholder = "0x0042"
const TokenPlaceholder = { symbol: "FLOW" }
const AmountPlaceholder = new Decimal(42)
const CreatedAtPlaceholder = new Date('2020-08-01T08:16:16Z')
const Timezone = getTimezone()

export default function RaffleCreator(props) {
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

  // const [token, setToken] = useState(null)
  // const [tokenBalance, setTokenBalance] = useState(new Decimal(0))

  const [timeLockEnabled, setTimeLockEnabled] = useState(false)
  const [startAt, setStartAt] = useState(null)
  const [endAt, setEndAt] = useState(null)

  const [eligibilityMode, setEligibilityMode] = useState(null)

  // For Whitelist
  const [whitelistReviewerCallback, setWhitelistReviewerCallback] = useState(null)

  // For Float
  const [floatEvents, setFloatEvents] = useState([])
  // [{eventID: xxx, eventHost: xxx}]
  const [floatEventPairs, setFloatEventPairs] = useState([])
  // {groupName: xxx, groupHost: xxx}
  const [floatGroup, setFloatGroup] = useState(null)
  const [threshold, setThreshold] = useState('')

  const [showPreview, setShowPreview] = useState(false)

  const [showCreatedModal, setShowCreatedModal] = useState(false)
  const [newDropURL, setNewDropURL] = useState(null)

  const [timezone, setTimezone] = useState(null)
  const [registrationDeadline, setRegistrationDeadline] = useState(null)
  const [numberOfWinners, setNumberOfWinners] = useState('')

  const [selectedNFT, setSelectedNFT] = useState(null)
  const [selectedTokens, setSelectedTokens] = useState({})

  useEffect(() => {
    setTimezone(Timezone)
  }, [timezone])

  useEffect(() => {
    if (float && float.trim() != '') {
      try {
        const eventPairs = floatEventInputHandler(float)
        setFloatEventPairs(eventPairs)
        setEligibilityMode(EligibilityModeFLOAT)
      } catch (e) { }
    }

    if (float_group && float_group.trim() != '') {
      try {
        const group = floatGroupInputHandler(float_group)
        setFloatGroup(group)
        setEligibilityMode(EligibilityModeFLOATGroup)
      } catch (e) { }
    }
  }, [float, float_group])

  const checkBasicParams = () => {
    if (!name || name.trim() == "") {
      return [false, Hints.InvalidName]
    }

    if (url && !isValidHttpUrl(url)) {
      return [false, Hints.InvalidURL]
    }

    console.log(selectedNFT)
    if (!selectedNFT) {
      return [false, Hints.InvalidNFT]
    }

    if (bannerSize > 500000) {
      return [false, Hints.BannerOversize]
    }

    if (endAt && isFinite(endAt) && endAt.getTime() < (new Date()).getTime()) {
      return [false, Hints.RaffleEnded]
    }

    if (!registrationDeadline || 
      !isFinite(registrationDeadline) || 
      registrationDeadline.getTime() < (new Date()).getTime() ||
      (endAt && isFinite(endAt) && registrationDeadline.getTime() >= endAt.getTime())) {
        return [false, Hints.InvalidRegistrationDeadline]
    }

    if (startAt && isFinite(startAt) && endAt && startAt.getTime() >= endAt.getTime()) {
      return [false, Hints.InvalidTimeLimit]
    }

    if (!numberOfWinners || isNaN(parseInt(numberOfWinners))) {
      return [false, Hints.InvalidNumberOfWinners]
    }

    const _numberOfWinners = new Decimal(numberOfWinners)
    if (!(_numberOfWinners.isInteger() && _numberOfWinners.toNumber() >= 1)) {
      return [false, Hints.InvalidNumberOfWinners]
    }

    const numberOfNFTs = Object.values(selectedTokens).filter((info) => info.isSelected).length
    if (numberOfNFTs < numberOfWinners) {
      return [false, Hints.InsufficientNFTs]
    }

    return [true, null]
  }

  const checkEligibilityParams = () => {
    if (eligibilityMode.key === EligibilityModeFLOATGroup.key) {
      return EligibilityModeFLOATGroup.checkRaffleParams(
        floatEvents, threshold
      )
    }

    if (eligibilityMode.key === EligibilityModeFLOAT.key) {
      return EligibilityModeFLOAT.checkRaffleParams(
        floatEvents, threshold
      )
    }

    if (eligibilityMode.key === EligibilityModeWhitelist.key) {
      return EligibilityModeWhitelist.checkRaffleParams(
        whitelistReviewerCallback
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
      eventHosts: [],
      withFloatGroup: false,
      floatGroupName: null,
      floatGroupHost: null
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

    } else if (eligibilityMode.key === EligibilityModeFLOATGroup.key) {
      params.withFloatGroup = true
      params.threshold = threshold
      params.floatGroupName = floatGroup.groupName
      params.floatGroupHost = floatGroup.groupHost
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

    if (mode.key === EligibilityModeWhitelist.key) {
      return (
        <WhitelistReviewer
          user={props.user}
          callback={setWhitelistReviewerCallback}
          withTokenSelector={false}
          withDistributorSelector={false}
        />
      )
    }

    if (mode.key === EligibilityModeFLOAT.key || mode.key === EligibilityModeFLOATGroup.key) {
      return (
        <FloatReviewer
          user={props.user}
          floatMode={mode.detail}
          threshold={threshold} setThreshold={setThreshold}
          rawFloatInput={float || float_group}
          floatEvents={floatEvents}
          setFloatEvents={setFloatEvents}
          setFloatEventPairs={setFloatEventPairs}
          setFloatGroup={setFloatGroup}
          withTokenSelector={false}
          withDistributorSelector={false}
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
          CREATE NFT RAFFLE
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
              host={(props.user && props.user.addr) ? props.user.addr : HostPlaceholder}
              createdAt={CreatedAtPlaceholder}
              description={description ?? DescriptionPlaceholder}
              token={token || TokenPlaceholder}
              timeLockEnabled={timeLockEnabled}
              startAt={startAt}
              endAt={endAt}
              amount={AmountPlaceholder}
              eligibilityMode={eligibilityMode}
              floatGroup={floatGroup}
              floatEventPairs={floatEventPairs}
              threshold={threshold}
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <StatsCard isPreview={true}
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
        />

        <div className="flex flex-col">
          <label className="text-2xl font-bold font-flow">
            # of Winners
          </label>
          <label className="block text-md font-flow leading-6 mt-2 mb-2">
            The max number of winners to be drawn
          </label>
          <input
            type="number"
            disabled={transactionInProgress}
            min="1"
            // max={floatEvents.length}
            value={numberOfWinners}
            id="numberOfWinners"
            className="grow w-full rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 border-drizzle-green font-flow text-lg placeholder:text-gray-300"
            onWheel={(e) => e.target.blur()}
            onChange={(event) => { setNumberOfWinners(event.target.value) }}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-2xl font-bold font-flow">
            Registration Deadline{timezone ? ` (${timezone})` : ''}
          </label>
          <label className="block text-md font-flow leading-6 mt-2 mb-2">
            To be a candidate, eligible accounts should register before this date
          </label>
          <input
            type="datetime-local"
            disabled={transactionInProgress}
            id="start_at"
            className="mt-1 rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300 min-w-[220px]"
            onChange={(e) => { setRegistrationDeadline(new Date(e.target.value)) }}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Registration Eligibility
          </label>
          <EligibilityModeSelector type="RAFFLE" mode={eligibilityMode} setMode={setEligibilityMode} />
        </div>

        {showEligibilityModeInputs(eligibilityMode)}

        <NFTSelector
          user={props.user}
          selectedNFT={selectedNFT}
          setSelectedNFT={setSelectedNFT}
          selectedTokens={selectedTokens}
          setSelectedTokens={setSelectedTokens}
        />
      </div>

      {/** create button */}
      <div className="w-full mt-16 flex flex-col gap-y-5 sm:flex-row sm:justify-between sm:gap-x-10 items-center">
        {showPreview ?
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
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
            (transactionInProgress || !eligibilityMode) ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
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
      <DropCreatedModal open={showCreatedModal} setOpen={setShowCreatedModal} url={newDropURL} />
    </>
  )
}