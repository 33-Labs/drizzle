import Image from "next/image"
import React from 'react'
import publicConfig from "../../publicConfig"

import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState,
  nameServiceState
} from "../../lib/atoms"

import { ExternalLinkIcon } from "@heroicons/react/outline"
import { convertCadenceDateTime, displayUsername } from "../../lib/utils"
import ShareCard from "../common/ShareCard"
import CriteriaCard from "../common/CriteriaCard"
import TimeLimitCard from "../common/TimeLimitCard"
import TagsCard from "../common/TagsCard"
import ActionCard from "./ActionCard"

const MemoizeBanner = React.memo(({ banner }) => {
  return (
    <div className="w-full h-[240px] bg-drizzle-green relative">
      <Image src={banner} alt="" layout="fill" objectFit="cover" />
    </div>
  )
})
MemoizeBanner.displayName = "MemozieBanner"

const MemoizeName = React.memo(({ name, url }) => {
  return (
    <div className="w-full mb-2">
      {
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black text-3xl font-bold font-flow break-words underline decoration-drizzle-green decoration-2">
            {name}
            <span className="inline-flex items-baseline">
              <ExternalLinkIcon className="h-5 w-5 text-drizzle-green" />
            </span>
          </a>
        ) : (
          <label className="text-black text-2xl font-bold font-flow break-words">
            {name}
          </label>
        )
      }
    </div>
  )
})
MemoizeName.displayName = "MemoizeName"

const MemoizeBasicInfo = React.memo(({ nameService, host, createdAt, nft, eligibilityMode, raffle }) => {
  return (
    <div className="w-full flex flex-col -mt-3">
      <TagsCard info={{
        raffle: raffle,
        type: "RAFFLE",
        eligibilityMode: eligibilityMode,
        nft: nft
      }}
      />
      <label className="w-full font-flow text-sm text-gray-400 break-words">
        {"Created by "}
        <span>
          <a
            href={`${publicConfig.appURL}/${typeof host == "string" ? host : host.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline decoration-drizzle-green decoration-2">
              {typeof host == "string" ? host : displayUsername(host, nameService)}
          </a>
        </span>
      </label>
      <label className="w-full font-flow text-sm text-gray-400 break-words">
        {`Created at ${createdAt.toLocaleString()}`}
      </label>
    </div>
  )
})
MemoizeBasicInfo.displayName = "MemoizeBasicInfo"

const MemoizeDescription = React.memo(({ description }) => {
  return (
    <div className="w-full mb-10">
      <p className="w-full font-flow text-base break-words whitespace-pre-wrap">
        {description}
      </p>
    </div>
  )
})
MemoizeDescription.displayName = "MemoizeDescription"

export default function RaffleCard(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [nameService, ] = useRecoilState(nameServiceState)

  const isPreview = props.isPreview == true
  const setShowClaimedModal = props.setShowClaimedModal
  const setShowRegisteredModal = props.setShowRegisteredModal
  const setRewardInfo = props.setRewardInfo

  // Only created Raffle has claimStatus
  const { raffle, claimStatus, user, nft, selectedTokens,
    eligibilityMode, floatGroup, floatEventPairs, threshold } = props
  const raffleID = (raffle && raffle.raffleID) || props.raffleID
  const name = (raffle && raffle.name) || props.name
  const host = (raffle && raffle.host) || props.host
  const description = (raffle && raffle.description) || props.description
  const url = (raffle && raffle.url) || props.url
  const banner = (raffle && raffle.image) || props.banner

  // TODO: registery => registry
  const registrationDeadline = convertCadenceDateTime((raffle && raffle.registrationEndAt) || props.registrationEndAt)
  const createdAt = convertCadenceDateTime((raffle && raffle.createdAt) || props.createdAt)
  const startAt = convertCadenceDateTime((raffle && raffle.startAt) || props.startAt)
  const endAt = convertCadenceDateTime((raffle && raffle.endAt) || props.endAt)

  return (
    <div className="w-full justify-center flex flex-col gap-y-8 mt-2 mb-2 sm:flex-row sm:gap-x-8 text-black">
      <div className="flex flex-col
      shadow-drizzle bg-white
      ring-1 ring-black ring-opacity-5
      items-stretch rounded-3xl overflow-hidden grow
      sm:min-w-[320px]
      md:w-[480px]">
        <MemoizeBanner banner={banner || "/banner.png"} />
        <div className="flex flex-col p-5 sm:p-8 gap-y-5">
          <MemoizeName name={name} url={url} />
          <MemoizeBasicInfo nameService={nameService}
            host={host} createdAt={createdAt} nft={nft} eligibilityMode={eligibilityMode} raffle={raffle}
          />
          {(startAt || endAt || registrationDeadline) ?
            <TimeLimitCard startAt={startAt} endAt={endAt} registrationEndAt={registrationDeadline} /> : null}
          <MemoizeDescription description={description} />
        </div>
      </div>
      <div className="flex flex-col gap-y-8">
        <CriteriaCard
          type="Raffle"
          raffle={raffle} eligibilityMode={eligibilityMode}
          floatGroup={floatGroup} floatEventPairs={floatEventPairs} threshold={threshold}
        />
        <ActionCard
          isPreview={isPreview}
          claimStatus={claimStatus}
          raffle={raffle}
          host={host}
          nft={nft}
          user={user}
          setShowClaimedModal={setShowClaimedModal}
          setShowRegisteredModal={setShowRegisteredModal}
          setRewardInfo={setRewardInfo}
        /> 
        {
          raffleID && host ?
            <ShareCard url={`${publicConfig.appURL}/${host.address}/raffles/${raffleID}`} />
            : <ShareCard disabled={true} url={`${publicConfig.appURL}/create/ft_raffle`} />
        }
      </div>
    </div>
  )
}