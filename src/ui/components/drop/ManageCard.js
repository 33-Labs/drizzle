import { useEffect, useState } from "react"
import useSWR, { useSWRConfig } from 'swr'
import Decimal from "decimal.js"

import { useRecoilState } from "recoil"
import {
  alertModalContentState,
  basicNotificationContentState,
  showAlertModalState,
  showBasicNotificationState,
  transactionInProgressState,
  transactionStatusState
} from "../../lib/atoms"
import { deleteDrop, endDrop, togglePause } from "../../lib/cloud-transactions"
import { classNames } from "../../lib/utils"
import { queryBalance } from "../../lib/cloud-scripts"

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
  const [, setShowAlertModal] = useRecoilState(showAlertModalState)
  const [, setAlertModalContent] = useRecoilState(alertModalContentState)
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { mutate } = useSWRConfig()

  const { data: balanceData, error: balanceError } = useSWR(
    drop && manager ? ["balanceFetcher", drop.tokenInfo, manager] : null, balanceFetcher
  )

  useEffect(() => {
    if (balanceData) { setBalance(balanceData) }
  }, [balanceData])

  return (
    <div className="w-full flex flex-col">
      <label className="px-3 text-2xl font-bold font-flow">MANAGE</label>
      <div className="w-full mt-5 mb-10 bg-white
        overflow-hidden ring-1 ring-black ring-opacity-5 rounded-2xl
        shadow
        p-6 flex flex-col gap-y-2 items-center justify-start">
        <div className="w-full flex flex-col gap-y-3 sm:flex-row sm:justify-between sm:gap-x-3">
          <button
            type="button"
            className={classNames(
              (transactionInProgress || (drop && drop.isEnded)) ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              `rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress || (drop && drop.isEnded)}
            onClick={async () => {
              if (drop) {
                await togglePause(
                  drop.dropID,
                  setTransactionInProgress,
                  setTransactionStatus
                )

                mutate(["claimStatusFetcher", drop.dropID, manager, manager])
                mutate(["dropFetcher", drop.dropID, manager])
              }
            }}
          >
            {drop && drop.isPaused ? "RESUME" : "PAUSE"}
          </button>
          <button
            type="button"
            className={classNames(
              (transactionInProgress || (drop && drop.isEnded)) ? "bg-red-400/60" : "bg-red-400 hover:bg-red-500",
              `rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress || (drop && drop.isEnded)}
            onClick={async () => {
              setShowAlertModal(false)
              setAlertModalContent({
                content: "End DROP will send all remaining tokens back to your account, the rest of the eligible users will not be able to claim their rewards, and nobody can recover it",
                actionTitle: "End",
                action: async () => {
                  if (drop) {
                    await endDrop(
                      drop.dropID,
                      drop.tokenInfo.account,
                      drop.tokenInfo.receiverPath.identifier,
                      setTransactionInProgress,
                      setTransactionStatus
                    )
    
                    mutate(["claimStatusFetcher", drop.dropID, manager, manager])
                    mutate(["dropFetcher", drop.dropID, manager])
                  }
                }
              })
              setShowAlertModal(true)
              return
            }}>
            END
          </button>
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-red-400/60" : "bg-red-400 hover:bg-red-500",
              `rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress}
            onClick={async () => {
              setShowAlertModal(false)
              setAlertModalContent({
                content: "Delete DROP will send all remaining tokens back to your account, and no one can access the DROP again",
                actionTitle: "Delete",
                action: async () => {
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
                }
              })
              setShowAlertModal(true)
            }}>
            DELETE
          </button>
        </div>

        {/* <div className="mt-4 w-full items-start">
          <label className="w-full text-lg font-bold font-flow">{`Funding DROP (${drop.tokenInfo.symbol})`}</label>
          <label className="block text-md font-flow leading-6 mt-2 mb-2">Your balance is {balance.toString()} {drop.tokenInfo.symbol}</label>
        </div>
        <div className="w-full flex justify-between gap-x-3">
          <input
            type="number"
            name="deposit"
            id="deposit"
            min="0"
            className="rounded-xl focus:ring-drizzle-green focus:border-drizzle-green bg-drizzle-green-ultralight grow border-drizzle-green font-flow text-sm"
            disabled={transactionInProgress}
            value={rawDepositAmt}
            onWheel={(e) => e.target.blur()}
            onChange={(event) => {
              setRawDepositAmt(event.target.value)
            }}
          />
          <button
            type="button"
            className={classNames(
              transactionInProgress ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              `rounded-xl h-12 px-6 text-base font-medium shadow-sm text-black`
            )}
            disabled={transactionInProgress}
            onClick={async () => {
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
                  mutate(["dropFetcher", drop.dropID, manager])
                  mutate(["balanceFetcher", drop.tokenInfo, manager])
                } catch (error) {
                  setShowBasicNotification(true)
                  setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: error })
                }
              }
            }}
          >
            Deposit
          </button>
        </div> */}

        {/* <div className="mt-4 w-full items-start">
          <label className="w-full text-lg font-bold font-flow">Add New Whitelist</label>
        </div>
        <div className="w-full">
          <textarea
            rows={4}
            name="recipients"
            id="recipients"
            className="rounded-xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green-ultralight resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
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
        </div> */}

      </div>
    </div>
  )
}