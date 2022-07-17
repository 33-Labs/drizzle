import Decimal from "decimal.js"
import { classNames } from "../../lib/utils"
import { claim } from "../../lib/transactions"
import { useSWRConfig } from 'swr'
import * as fcl from "@onflow/fcl"

import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../../lib/atoms"

// [Emoji, Description, Amount, Title]
// TODO: need to handle random packet
  // // Random packet
  // if (reviewer && reviewer.packet && reviewer.packet.totalAmount) {
  //   return ["🎲", "CLAIM TO"]
  // }
const parseClaimStatus = (user, claimStatus, tokenSymbol, isPreview, reviewer) => {
  if (isPreview) { return ["👓", "YOU ARE ELIGIBLE FOR", `42 FLOW`, "PREVIEWING"] }
  const isRandomPacket = reviewer && reviewer.packet && reviewer.packet.totalAmount
  if (!user || !user.loggedIn) {
    return ["❓", "CONNECT WALLET TO CHECK ELIGIBILITY", null, "Connect Wallet"] 
  }

  if ((!claimStatus) || claimStatus.code.rawValue === "9") { 
    return ["❓", "UNKNOWN STATUS", null, "UNKNOWN"] 
  }
  if (claimStatus.code.rawValue === "0") { 
    if (isRandomPacket) {
      return ["🎲", "YOU ARE ELIGIBLE FOR", `❓ ${tokenSymbol}`, "CLAIM TO REVEAL"]
    }
    return ["🎉", "YOU ARE ELIGIBLE FOR", `${new Decimal(claimStatus.eligibleAmount).toString()} ${tokenSymbol}`, "CLAIM"]
  }
  if (claimStatus.code.rawValue === "1") {
    return ["🙉", "YOU ARE NOT ELIGIBLE", null, "NOT ELIGIBLE"]
  }
  if (claimStatus.code.rawValue === "2") {
    return ["⏹", "DROP NO LONGER AVAILABLE", null, "UNAVAILABLE"]
  }
  if (claimStatus.code.rawValue === "3") {
    return ["🎉", "YOU HAVE CLAIMED", `${new Decimal(claimStatus.eligibleAmount).toString()} ${tokenSymbol}`, "CLAIMED"]
  }
  if (claimStatus.code.rawValue === "4") {
    if (isRandomPacket) {
      return ["ℹ️", "YOU ARE ELIGIBLE FOR", `❓ ${tokenSymbol}`, "NOT START"]
    }
    return ["ℹ️", "YOU ARE ELIGIBLE FOR", `${new Decimal(claimStatus.eligibleAmount).toString()} ${tokenSymbol}`, "NOT START"]
  }
  if (claimStatus.code.rawValue === "5") {
    if (isRandomPacket) {
      return ["⏹", "DROP ENDED", null, "ENDED"]
    }
    return ["⏹", "YOU WERE ELIGIBLE FOR", `${new Decimal(claimStatus.eligibleAmount).toString()} ${tokenSymbol}`, "ENDED"]
  }
  if (claimStatus.code.rawValue === "6") {
    if (isRandomPacket) {
      return ["⏸️", "YOU ARE ELIGIBLE FOR", `❓ ${tokenSymbol}`, "PAUSED"]
    }
    return ["⏸️", "YOU ARE ELIGIBLE FOR", `${new Decimal(claimStatus.eligibleAmount).toString()} ${tokenSymbol}`, "PAUSED"]
  }
}

export default function ClaimCard(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { mutate } = useSWRConfig()

  const { isPreview, drop, host, user, token, tokenInfo, claimStatus } = props
  console.log("Drop ", drop)
  const symbol = isPreview ? (token && token.symbol) : (tokenInfo && tokenInfo.symbol)

  console.log(claimStatus)
  // [Emoji, Description, Amount, Title]
  const [emoji, description, amountInfo, title] = parseClaimStatus(user, claimStatus, symbol, isPreview, drop && drop.eligibilityReviewer)

  return (
    <div>
      <div className="flex flex-col bg-white text-black
      min-w-[240px] sm:max-w-[240px] min-h-[240px] justify-center
  ring-1 ring-black ring-opacity-5 rounded-3xl overflow-hidden p-5
  shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]
  ">
        <label className="block w-full text-center text-[60px]">{emoji}</label>
        <label className="block w-full mt-5 text-center text-lg font-bold font-flow">{description}</label>
        <label className="block w-full text-center mt-1 text-2xl font-bold font-flow">{amountInfo}</label>
        <button
          type="button"
          className={classNames(
            (isPreview || (claimStatus && claimStatus.code.rawValue != "0")) ? "bg-disabled-gray" :
              (transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark"),
            `mt-5 h-[48px] text-base font-medium shadow-sm text-black rounded-2xl`
          )}
          disabled={isPreview || (claimStatus && claimStatus.code.rawValue != "0") || transactionInProgress}
          onClick={async () => {
            if (!user || !user.loggedIn) {
              fcl.authenticate()
              return
            }

            if (isPreview || (claimStatus && claimStatus.code.rawValue != "0") || !drop) {
              return
            }

            await claim(drop.dropID, host, tokenInfo,
              setTransactionInProgress,
              setTransactionStatus)

            mutate(["claimStatusFetcher", drop.dropID, host, user && user.addr])
            mutate(["dropFetcher", drop.dropID, host])
          }}
        >
          {title}
        </button>
      </div>
    </div>
  )
}