import Image from "next/image"
import React from 'react'
import publicConfig from "../publicConfig"

import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"

import { test } from "../lib/transactions"

const MemoizeBanner = React.memo(({banner}) => {
  return (
    <div className="w-full h-[240px] bg-drizzle-green relative">
      <Image src={banner} alt="" layout="fill" objectFit="cover" />
    </div>
  )
})
MemoizeBanner.displayName = "MemozieBanner"

const titleForClaimButton = (claimStatus) => {
  if (claimStatus.message == "not eligible") {
    return "NOT ELIGIBLE"
  }

  if (claimStatus.message == "not claimable") {
    return "NOT CLAIMABLE NOW"
  }

  if (claimStatus.message == "not start") {
    return "NOT START NOW"
  }

  if (claimStatus.message == "ended") {
    return "ENDED"
  }

  if (claimStatus.message == "claimed") {
    return "YOU HAVE CLAIMED"
  }

  if (claimStatus.message == "eligible") {
    return "CLAIM"
  }

  return "NOT ELIGIBLE"
}

export default function DropCard(props) {
  const isPreview = props.isPreview == true

  const createdAt = props.createdAt || "unknown"
  const timeLockEnabled = props.timeLockEnabled || false
  const startAt = props.startAt
  const endAt = props.endAt

  const dropID = props.dropID
  const name = props.name
  const host = props.host || "unknown"
  const desc = props.description
  const status = props.status
  console.log(status)

  const token = props.token
  console.log(token)
  const amount = props.amount || status.amount
  const symbol = props.tokenSymbol || (token && token.symbol)
  const banner = props.banner || "/drizzle.png"
  const url = props.url

  const [, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  return (
    <div className="flex flex-col w-[480px] min-w-[320px] shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] mt-5 mb-10 items-stretch">
      <MemoizeBanner banner={banner} />
      <div className="w-full px-8 mt-4">
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
        {timeLockEnabled ? (
          startAt ? 
          <label className="w-full font-flow text-sm text-gray-400 break-words" id="start_at">
            {`start at ${startAt.toLocaleString()}`}
          </label> : null
        ) : null}
        {timeLockEnabled ? (
          endAt ? 
          <label className="w-full font-flow text-sm text-gray-400 break-words" id="end_at">
            {`end at ${endAt.toLocaleString()}`}
          </label> : null
        ) : null}
      </div>

      <div className="w-full px-8 mb-4">
        <p className="w-full font-flow text-sm break-words whitespace-pre-wrap">
          {desc}
        </p>
      </div>

      {
        (isPreview || (status && status.amount)) ? (
          <>
          <div className="mt-20 w-full px-8">
            <label className="text-lg font-bold font-flow">YOU ARE ELIGIBLE FOR</label>
          </div>
          <div className="mt-1 w-full px-8">
            <label className="text-2xl font-bold font-flow">{`${amount} ${symbol}`}</label>
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
        ${(isPreview || !status.claimable) ? "bg-gray-400 hover:bg-gray-500" : "bg-drizzle-green hover:bg-drizzle-green-dark"}`}
        disabled={!(status && status.claimable)}
        onClick={async () => {
          console.log("YEYE")
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
        {isPreview ? "PREVIEWING" : (
          titleForClaimButton(status)
        )}
      </button>
    </div>
  )
}