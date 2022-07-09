import Decimal from "decimal.js"
import { classNames } from "../lib/utils"
import { test } from "../lib/transactions"

import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"

const parseClaimStatus = (claimStatus, isPreview) => {
  if (isPreview) { return ["PREVIEWING", "🎉"] }
  if (!claimStatus) { return ["NOT ELIGIBLE", "🙉"] }
  if (claimStatus.message == "not eligible") { return ["NOT ELIGIBLE", "🙉" ]}
  if (claimStatus.message == "not claimable") { return ["NOT CLAIMABLE", "⏸"] }
  if (claimStatus.message == "not start") { return ["NOT START", "ℹ️"] }
  if (claimStatus.message == "ended") { return ["ENDED", "ℹ️"] }
  if (claimStatus.message == "claimed") { return ["YOU HAVE CLAIMED", "🎉"] }
  if (claimStatus.message == "eligible") { return ["CLAIM", "🎉"] }
  return ["NOT ELIGIBLE", "🙉"]
}

export default function ClaimCard(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const { isPreview, token, tokenInfo, claimStatus } = props
  const amount = isPreview ? new Decimal(42) : new Decimal((claimStatus && claimStatus.amount) || props.amount || 0)
  const symbol = isPreview ? (token && token.symbol) : (tokenInfo && tokenInfo.symbol)

  const [title, emoji] = parseClaimStatus(claimStatus, isPreview)

  return (
    <div>
      <div className="flex flex-col 
      min-w-[240px] min-h-[240px] justify-center
  ring-1 ring-black ring-opacity-5 rounded-3xl overflow-hidden p-5
  shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]
  ">
        <label className="block w-full text-center text-[60px]">{emoji}</label>
        <label className="block w-full mt-5 text-center text-lg font-bold font-flow">YOU ARE ELIGIBLE FOR</label>
        <label className="block w-full text-center mt-1 text-2xl font-bold font-flow">{`${amount.toString()} ${symbol}`}</label>
        <button
          type="button"
          className={classNames(
            (isPreview || !claimStatus.claimable) ? "bg-disabled-gray" :
              (transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark"),
            `mt-5 h-[48px] text-base font-medium shadow-sm text-black rounded-2xl`
          )}
          disabled={isPreview || !(claimStatus && claimStatus.claimable) || transactionInProgress}
          onClick={async () => {
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
          {title}
        </button>
      </div>
    </div>
  )
}