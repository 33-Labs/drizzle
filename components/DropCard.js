import Image from "next/image"
import React from 'react'
import publicConfig from "../publicConfig"

import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"

import { test } from "../lib/transactions"
import Decimal from "decimal.js"

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
    <div className="w-full px-8 mt-7 mb-6">
      {
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black text-2xl font-bold font-flow break-words underline decoration-drizzle-green decoration-2">
            {name}
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

const MemoizeBasicInfo = React.memo(({ host, createdAt, startAt, endAt }) => {
  return (
    <div className="w-full px-8 mb-4 flex flex-col">
      <label className="w-full font-flow text-sm text-gray-400 break-words">
        {"created by "}
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
        {`created at ${createdAt.toLocaleString()}`}
      </label>
      { startAt ?
          <label className="w-full font-flow text-sm text-gray-400 break-words" id="start_at">
            {`start at ${startAt.toLocaleString()}`}
          </label> : null
      }
      {
        endAt ?
          <label className="w-full font-flow text-sm text-gray-400 break-words" id="end_at">
            {`end at ${endAt.toLocaleString()}`}
          </label> : null
      }
    </div>
  )
})
MemoizeBasicInfo.displayName = "MemoizeBasicInfo"

const MemoizeDescription = React.memo(({ description }) => {
  return (
    <div className="w-full px-8 mb-4">
      <p className="w-full font-flow text-sm break-words whitespace-pre-wrap">
        {description}
      </p>
    </div>
  )
})
MemoizeDescription.displayName = "MemoizeDescription"

const titleForClaimButton = (claimStatus, isPreview) => {
  if (isPreview) { return "PREVIEWING" }
  if (claimStatus.message == "not eligible") { return "NOT ELIGIBLE" }
  if (claimStatus.message == "not claimable") { return "NOT CLAIMABLE NOW" }
  if (claimStatus.message == "not start") { return "NOT START NOW" }
  if (claimStatus.message == "ended") { return "ENDED" }
  if (claimStatus.message == "claimed") { return "YOU HAVE CLAIMED" }
  if (claimStatus.message == "eligible") { return "CLAIM" }
  return "NOT ELIGIBLE"
}

export default function DropCard(props) {
  const [, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const isPreview = props.isPreview == true
  // Only created Drop has claimStatus
  const { token, tokenInfo, claimStatus } = props
  const amount = new Decimal((claimStatus && claimStatus.amount) || props.amount || 0)
  const symbol = isPreview ? (token && token.symbol) : (tokenInfo && tokenInfo.symbol)

  return (
    <div className="flex flex-col w-[480px] min-w-[320px] shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] mt-5 mb-10 items-stretch rounded-3xl overflow-hidden">
      {/* TODO: replace with new placeholder */}
      <MemoizeBanner banner={props.banner || "/drizzle.png"} />
      <MemoizeName name={props.name} url={props.url} />
      <MemoizeBasicInfo
        host={props.host} createdAt={props.createdAt}
        startAt={props.startAt} endAt={props.endAt}
      />
      <MemoizeDescription description={props.description} />

      {
        (isPreview || (claimStatus && claimStatus.amount)) ? (
          <>
            <div className="mt-20 w-full px-8">
              <label className="text-lg font-bold font-flow">YOU ARE ELIGIBLE FOR</label>
            </div>
            <div className="mt-1 w-full px-8">
              <label className="text-2xl font-bold font-flow">{`${amount.toString()} ${symbol}`}</label>
            </div>
          </>
        ) : (
          <div className="mt-20 w-full px-8">
            <label className="text-lg font-bold font-flow">YOU ARE NOT ELIGIBLE</label>
          </div>
        )
      }

      <button
        type="button"
        className={`mt-10 mx-8 mb-8 h-[48px] text-base font-medium shadow-sm text-black 
        ${(isPreview || !claimStatus.claimable) ? "bg-gray-400 hover:bg-gray-500" : "bg-drizzle-green hover:bg-drizzle-green-dark"}`}
        disabled={!(claimStatus && claimStatus.claimable)}
        onClick={async () => {
          setTransactionInProgress(false)
          await test(
            setTransactionInProgress,
            setTransactionStatus
          )
          // if (!isPreview && status.claimable) {
          //   try {
          //     const transactionId = await drizzleService.claim(
          //       dropID, 
          //       host, 
          //       token.account,
          //       token.contractName,
          //       token.providerPath.identifier,
          //       token.balancePath.identifier,
          //       token.receiverPath.identifier
          //     )
          //     console.log("txid: " + transactionId)
          //     await fcl.tx(transactionId).onceSealed()
          //   } catch (e) {
          //     console.log(e)
          //   }
          // }
        }}
      >
        {titleForClaimButton(claimStatus, isPreview)}
      </button>
    </div>
  )
}