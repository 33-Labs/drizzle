import Image from "next/image"
import React from 'react'
import publicConfig from "../publicConfig"

const MemoizeBanner = React.memo(({banner}) => {
  return (
    <div className="w-full h-[240px] bg-drizzle-green relative">
      <Image src={banner} alt="" layout="fill" objectFit="cover" />
    </div>
  )
})

export default function DropCard(props) {
  const isPreview = props.isPreview || true

  const createdAt = props.createdAt || "unknown"
  const timeLockEnabled = props.timeLockEnabled || false
  const timezone = props.timezone
  const startAt = props.startAt
  const endAt = props.endAt

  const name = props.name
  const host = props.host || "unknown"
  const desc = props.description
  const amount = props.amount
  const symbol = props.tokenSymbol
  const banner = props.banner || "/drizzle.png"

  return (
    <div className="flex flex-col w-[480px] min-w-[320px] shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] mt-5 mb-10 items-stretch">
      <MemoizeBanner banner={banner} />
      <div className="w-full px-8 mt-4">
        <label className="text-2xl font-bold font-flow break-words">
          {name}
        </label>
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
          {`created at ${createdAt.toLocaleString()} (${timezone})`}
        </label>
        {timeLockEnabled ? (
          startAt ? 
          <label className="w-full font-flow text-sm text-gray-400 break-words" id="start_at">
            {`start at ${startAt.toLocaleString()} (${timezone})`}
          </label> : null
        ) : null}
        {timeLockEnabled ? (
          endAt ? 
          <label className="w-full font-flow text-sm text-gray-400 break-words" id="end_at">
            {`end at ${endAt.toLocaleString()} (${timezone})`}
          </label> : null
        ) : null}
      </div>

      <div className="w-full px-8 mb-4">
        <p className="w-full font-flow text-sm break-words whitespace-pre-wrap">
          {desc}
        </p>
      </div>

      <div className="mt-20 w-full px-8">
        <label className="text-lg font-bold font-flow">YOU ARE ELIGIBLE FOR</label>
      </div>
      <div className="mt-1 w-full px-8">
        <label className="text-2xl font-bold font-flow">{`${amount} ${symbol}`}</label>
      </div>

      <button
        type="button"
        className="mt-10 mx-8 mb-8 h-[48px] text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
        disabled={!isPreview}
        >
        {isPreview ? "previewing" : "claim"}
      </button>
    </div>
  )
}