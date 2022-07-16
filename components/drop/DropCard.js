import Image from "next/image"
import React from 'react'
import publicConfig from "../../publicConfig"

import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../../lib/atoms"

import { test } from "../../lib/transactions"
import Decimal from "decimal.js"
import { ExternalLinkIcon } from "@heroicons/react/outline"
import { classNames, convertCadenceDateTime } from "../../lib/utils"
import ShareCard from "./ShareCard"
import ClaimCard from "./ClaimCard"
import CriteriaCard from "./CriteriaCard"
import TimeLimitCard from "./TimeLimitCard"
import TagsCard from "./TagsCard"

const MemoizeBanner = React.memo(({ banner }) => {
  return (
    <div className="w-full h-[240px] bg-drizzle-green relative">
      <Image priority src={banner} alt="" layout="fill" objectFit="cover" />
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

const MemoizeBasicInfo = React.memo(({ host, createdAt, tokenInfo, reviewer }) => {
  return (
    <div className="w-full flex flex-col -mt-3">
      {
        tokenInfo ? 
        <TagsCard tokenInfo={tokenInfo} reviewer={reviewer} />
        : null
      }
      <label className="w-full font-flow text-sm text-gray-400 break-words">
        {"Created by "}
        <span>
          <a
            href={`${publicConfig.flowscanURL}/account/${host}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline decoration-drizzle-green decoration-2">{host}
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

export default function DropCard(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const isPreview = props.isPreview == true

  // Only created Drop has claimStatus
  const { drop, claimStatus, user, token } = props
  const dropID = (drop && drop.dropID) || props.dropID
  const name = (drop && drop.name) || props.name
  const host = (drop && drop.host) || props.host
  const description = (drop && drop.description) || props.description
  const url = (drop && drop.url) || props.url
  const banner = (drop && drop.image) || props.banner
  const createdAt = convertCadenceDateTime((drop && drop.createdAt) || props.createdAt)
  const startAt = convertCadenceDateTime((drop && drop.startAt) || props.startAt)
  const endAt = convertCadenceDateTime((drop && drop.endAt) || props.endAt)
  const tokenInfo = (drop && drop.tokenInfo) || props.tokenInfo
  const reviewer = (drop && drop.eligibilityReviewer)

  console.log(claimStatus)

  return (
    <div className="w-full justify-center flex flex-col gap-y-8 mt-2 mb-2 sm:flex-row sm:gap-x-8 bg-white text-black">
      <div className="flex flex-col
      shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]
      ring-1 ring-black ring-opacity-5
      items-stretch rounded-3xl overflow-hidden grow
      sm:min-w-[320px]
      md:w-[480px]">
        <MemoizeBanner banner={banner || "/flow-banner.jpg"} />
        <div className="flex flex-col p-8 gap-y-5">

          <MemoizeName name={name} url={url} />
          <MemoizeBasicInfo
            host={host} createdAt={createdAt} tokenInfo={tokenInfo} reviewer={reviewer}
          />
          {(startAt || endAt) ?
            <TimeLimitCard startAt={startAt} endAt={endAt} /> : null}
          <MemoizeDescription description={description} />
        </div>
      </div>
      <div className="flex flex-col gap-y-8">
        <CriteriaCard mode={props.eligilityMode} />
        <ClaimCard
          isPreview={isPreview}
          claimStatus={claimStatus}
          dropID={dropID}
          host={host}
          token={token}
          tokenInfo={tokenInfo}
          user={user}
        />
        {
          dropID && host ?
            <ShareCard url={`${publicConfig.appURL}/${host}/drops/${dropID}`} />
            : <ShareCard disabled={true} url={`${publicConfig.appURL}/new_drop`} />
        }
      </div>
    </div>
  )
}