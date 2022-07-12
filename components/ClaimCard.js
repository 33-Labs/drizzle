import Decimal from "decimal.js"
import { classNames } from "../lib/utils"
import { claim, test } from "../lib/transactions"
import { useSWRConfig } from 'swr'

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
  const { mutate } = useSWRConfig()

  const { isPreview, dropID, host, user, token, tokenInfo, claimStatus } = props
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
            if (isPreview || !(claimStatus && claimStatus.claimable) || !dropID) {
              return
            }

            await claim(dropID, host, tokenInfo,
              setTransactionInProgress,
              setTransactionStatus)

            mutate(["claimStatusFetcher", dropID, host, user && user.addr])
            mutate(["statsFetcher", dropID, host])
          }}
        >
          {title}
        </button>
      </div>
    </div>
  )
}