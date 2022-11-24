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
import { batchDraw, deleteRaffle, draw, endRaffle, togglePause } from "../../lib/mist-transactions"
import { classNames } from "../../lib/utils"

const isDrawable = (claimStatus, raffle) => {
  if (!raffle) return false
  if (!claimStatus) return false
  return claimStatus.availability.status.rawValue === "3"
}

export default function RaffleManageCard(props) {
  const { raffle, manager, claimStatus } = props
  const [, setShowAlertModal] = useRecoilState(showAlertModalState)
  const [, setAlertModalContent] = useRecoilState(alertModalContentState)
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { mutate } = useSWRConfig()
  const _isDrawable = isDrawable(claimStatus, raffle)

  return (
    <div className="w-full flex flex-col">
      <label className="px-3 text-2xl font-bold font-flow">MANAGE</label>
      <div className="w-full mt-4 mb-10 bg-white
        overflow-hidden ring-1 ring-black ring-opacity-5 rounded-2xl
        shadow
        p-6 flex flex-col gap-y-2 items-center justify-start">
        <div className="flex w-full">
          <label className="px-1 text-md font-flow leading-6 mb-2">Only available in&nbsp;
            <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-6 text-yellow-800 bg-yellow-100">
              DRAWING
            </span> stage</label>
        </div>
        <div className="w-full flex flex-col gap-y-3 sm:flex-row sm:justify-between sm:gap-x-3">
          <button
            type="button"
            className={classNames(
              (transactionInProgress || !_isDrawable) ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              `rounded-xl min-h-[60px] basis-1/2 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress || !_isDrawable}
            onClick={async () => {
              if (raffle) {
                await draw(
                  raffle.raffleID,
                  setTransactionInProgress,
                  setTransactionStatus
                )

                mutate(["raffleClaimStatusFetcher", raffle.raffleID, manager.address, manager.address])
                mutate(["raffleFetcher", raffle.raffleID, manager.address])
              }
            }}
          >
            DRAW
          </button>
          <button
            type="button"
            className={classNames(
              (transactionInProgress || !_isDrawable) ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              `rounded-xl min-h-[60px] basis-1/2 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress || !_isDrawable}
            onClick={async () => {
              if (raffle) {
                await batchDraw(
                  raffle.raffleID,
                  setTransactionInProgress,
                  setTransactionStatus
                )

                mutate(["raffleClaimStatusFetcher", raffle.raffleID, manager.address, manager.address])
                mutate(["raffleFetcher", raffle.raffleID, manager.address])
              }
            }}>
            BATCH DRAW
          </button>
        </div>

        <div className="w-full bg-gray-100 h-[1px] mt-3 mb-3"></div>

        <div className="w-full flex flex-col gap-y-3 sm:flex-row sm:justify-between sm:gap-x-3">
          <button
            type="button"
            className={classNames(
              (transactionInProgress || (raffle && raffle.isEnded)) ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              `rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress || (raffle && raffle.isEnded)}
            onClick={async () => {
              if (raffle) {
                await togglePause(
                  raffle.raffleID,
                  setTransactionInProgress,
                  setTransactionStatus
                )

                mutate(["raffleClaimStatusFetcher", raffle.raffleID, manager.address, manager.address])
                mutate(["raffleFetcher", raffle.raffleID, manager.address])
              }
            }}
          >
            {raffle && raffle.isPaused ? "RESUME" : "PAUSE"}
          </button>
          <button
            type="button"
            className={classNames(
              (transactionInProgress || (raffle && raffle.isEnded)) ? "bg-red-400/60" : "bg-red-400 hover:bg-red-500",
              `rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black`
            )}
            disabled={transactionInProgress || (raffle && raffle.isEnded)}
            onClick={async () => {
              setShowAlertModal(false)
              setAlertModalContent({
                content: "End Raffle will send all remaining NFTs back to your account, all functions of the Raffle will be stop, and nobody can recover it",
                actionTitle: "End",
                action: async () => {
                  if (raffle) {
                    await endRaffle(
                      raffle.raffleID,
                      raffle.nftInfo.contractName,
                      raffle.nftInfo.contractAddress,
                      setTransactionInProgress,
                      setTransactionStatus
                    )

                    mutate(["raffleClaimStatusFetcher", raffle.raffleID, manager.address, manager.address])
                    mutate(["raffleFetcher", raffle.raffleID, manager.address])
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
                content: "Delete Raffle will send all remaining NFTs back to your account, and no one can access the Raffle again",
                actionTitle: "Delete",
                action: async () => {
                  if (raffle) {
                    await deleteRaffle(
                      raffle.raffleID,
                      raffle.nftInfo.contractName,
                      raffle.nftInfo.contractAddress,
                      setTransactionInProgress,
                      setTransactionStatus
                    )

                    mutate(["raffleFetcher", raffle.raffleID, manager.address])
                  }
                }
              })
              setShowAlertModal(true)
            }}>
            DELETE
          </button>
        </div>
      </div>
    </div>
  )
}