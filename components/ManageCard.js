import { deleteDrop, toggleClaimable, withdrawFunds } from "../lib/transactions"
import { classNames } from "../lib/utils"

import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"

import { useSWRConfig } from 'swr'

export default function ManageCard(props) {
  const { drop, manager, claimStatus, setClaimStatus } = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const { mutate } = useSWRConfig()

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
              console.log("YEYE")
              if (drop) {
                console.log(drop)
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
                console.log(drop)
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
        </div>
        <div className="w-full flex justify-between gap-x-3">
          <input
            type="number"
            name="deposit"
            id="deposit"
            className="rounded-xl focus:ring-drizzle-green focus:border-drizzle-green bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-sm"
          />
          <button
            type="button"
            className="rounded-xl h-12 w-32 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            disabled={transactionInProgress}
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