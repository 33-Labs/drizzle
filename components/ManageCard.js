import { useEffect, useState } from "react"
import useSWR, { useSWRConfig } from 'swr'
import Decimal from "decimal.js"

import { useRecoilState } from "recoil"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import { deleteDrop, depositToDrop, toggleClaimable, withdrawFunds } from "../lib/transactions"
import { classNames } from "../lib/utils"
import { queryBalance } from "../lib/scripts"

// tokenInfo in Drizzle
const balanceFetcher = async (funcName, tokenInfo, account) => {
  const token = {
    address: tokenInfo.account,
    contractName: tokenInfo.contractName,
    path: {
      balance: `/public/${tokenInfo.balancePath.identifier}`,
    }
  }
  return await queryBalance(token, account)
}

export default function ManageCard(props) {
  const { drop, manager, claimStatus } = props
  const [balance, setBalance] = useState(new Decimal(0))
  const [rawDepositAmt, setRawDepositAmt] = useState('')
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { mutate } = useSWRConfig()
  
  const { data: balanceData, error: balanceError} = useSWR(
    drop && manager ? ["balanceFetcher", drop.tokenInfo, manager] : null, balanceFetcher
  )

  useEffect(() => {
    if (balanceData) { setBalance(balanceData)}
  }, [balanceData])

  return (
    <>
      <label className="text-2xl font-bold font-flow">Manage DROP</label>
      <div className="w-full mt-5 mb-10 
        overflow-hidden ring-1 ring-black ring-opacity-5 rounded-2xl
        shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] 
        p-6 flex flex-col gap-y-2 items-center justify-start">
        <div className="w-full flex justify-between gap-x-3">
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              `rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress}
            onClick={async () => {
              if (drop) {
                await toggleClaimable(
                  drop.dropID,
                  setTransactionInProgress,
                  setTransactionStatus
                )

                mutate(["claimStatusFetcher", drop.dropID, manager, manager])
              }
            }}
          >
            {claimStatus.message == "not claimable" ? "Recover" : "Pause"}
          </button>
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-yellow-400/60" : "bg-yellow-400 hover:bg-yellow-500",
              `rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress}
            onClick={async () => {
              if (drop) {
                await withdrawFunds(
                  drop.dropID,
                  drop.tokenInfo.account,
                  drop.tokenInfo.receiverPath.identifier,
                  setTransactionInProgress,
                  setTransactionStatus
                )

                mutate(["statsFetcher", drop.dropID, manager])
              }
            }}>
            Withdraw Funds
          </button>
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-red-400/60" : "bg-red-400 hover:bg-red-500",
              `rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress}
            onClick={async () => {
              if (drop) {
                await deleteDrop(
                  drop.dropID,
                  drop.tokenInfo.account,
                  drop.tokenInfo.receiverPath.identifier,
                  setTransactionInProgress,
                  setTransactionStatus
                )

                mutate(["dropFetcher", drop.dropID, manager])
              }
            }}>
            Delete
          </button>
        </div>

        <div className="mt-4 w-full items-start">
          <label className="w-full text-lg font-bold font-flow">{`Funding DROP (${drop.tokenInfo.symbol})`}</label>
          <label className="block text-md font-flow leading-6 mt-2 mb-2">Your balance is {balance.toString()} {drop.tokenInfo.symbol}</label> 
        </div>
        <div className="w-full flex justify-between gap-x-3">
          <input
            type="number"
            name="deposit"
            id="deposit"
            min="0"
            className="rounded-xl focus:ring-drizzle-green focus:border-drizzle-green bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-sm"
            disabled={transactionInProgress}
            value={rawDepositAmt}
            onChange={(event) => { 
              setRawDepositAmt(event.target.value)
            }}
          />
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              `rounded-xl h-12 w-32 px-3 text-base font-medium shadow-sm text-black`
            )}
            disabled={transactionInProgress}
            onClick={ async () => {
              setShowBasicNotification(false)
              if (drop) {
                try {
                  const amount = new Decimal(rawDepositAmt)
                  if (!amount.isPositive() || amount.decimalPlaces() > 8) { throw "Invalid amount. Should be positive with 8 decimal places at most" }
                  await depositToDrop(
                    drop.dropID, drop.tokenInfo, amount.toFixed(8),
                    setTransactionInProgress, setTransactionStatus
                  )
                  
                  setRawDepositAmt('')
                  mutate(["statsFetcher", drop.dropID, manager])
                  mutate(["balanceFetcher", drop.tokenInfo, manager])
                } catch (error) {
                  setShowBasicNotification(true)
                  setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: error}) 
                }
              }
            }}
          >
            Deposit
          </button>
        </div>
        <div className="mt-4 w-full items-start">
          <label className="w-full text-lg font-bold font-flow">Add New Claims</label>
        </div>
        <div className="w-full">
          <textarea
            rows={4}
            name="recipients"
            id="recipients"
            className="rounded-xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
            defaultValue={''}
            spellCheck={false}
            placeholder={
              "0xf8d6e0586b0a20c7,1.6"
            }
            onChange={(event) => { }}
          />
          <button
            type="button"
            className="rounded-xl mt-4 h-12 w-24 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            disabled={transactionInProgress}
          >
            Add
          </button>
        </div>

      </div>
    </>
  )
}