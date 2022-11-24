import { useState } from "react"
import Link from 'next/link'
import { convertCadenceDateTime, displayUsername, getItemsInPage } from '../../lib/utils'
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid"
import Decimal from "decimal.js"
import { nameServiceState } from "../../lib/atoms"
import { useRecoilState } from "recoil"

export default function ClaimHistory(props) {
  const { records, user, pageAccount } = props

  const [nameService, ] = useRecoilState(nameServiceState)

  let isCurrentUser = false
  if (user && user.addr === pageAccount) {
    isCurrentUser = true
  }
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  return (
    <div className="p-2">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {`Claimed DROPs (${records.length})`}
          </h1>
        </div>
      </div>

      {records.length > 0 ?
        <div className="mt-3 flex flex-col w-full">
          <div className="px-1 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 px-3 sm:pl-6 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                        Host 
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Claimed Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Claimed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {getItemsInPage(records, currentPage, pageSize).map((drop) => (
                      <Link key={`${drop.dropID}-link`} href={`${drop.host.address}/drops/${drop.dropID}`}>
                        <tr key={drop.dropID}>
                          <td className="py-4 px-3 text-sm sm:pl-6">
                            <label className="block font-medium text-gray-900 break-words max-w-[300px] min-w-[60px]">{drop.name}</label>
                          </td>
                          <td className="py-4 px-3 text-sm">
                            <label className="block font-medium text-gray-500 break-words max-w-[300px] min-w-[60px]">
                              {displayUsername(drop.host, nameService)}
                            </label>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-gray-500">
                            {new Decimal(drop.claimedAmount).toString()} {drop.tokenSymbol}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {convertCadenceDateTime(drop.claimedAt).toLocaleString()}
                          </td>
                        </tr>
                      </Link>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {records.length > pageSize ?
            <div className="mt-2 flex justify-between">
              <button
                className="bg-gray-50 p-2 rounded-full overflow-hidden shadow ring-1 ring-black ring-opacity-5"
                disabled={currentPage == 1}
                onClick={() => {
                  if (currentPage == 1) { return }
                  setCurrentPage(currentPage - 1)
                }}
              >
                <ArrowLeftIcon
                  className={`h-5 w-5 ${currentPage == 1 ? "text-gray-400" : "text-black"}`}
                />
              </button>
              <button
                className="bg-gray-50 h-9 w-9 rounded-full overflow-hidden shadow ring-1 ring-black ring-opacity-5"
                disabled={true}
              >{currentPage}</button>
              <button
                className="bg-gray-50 p-2 rounded-full overflow-hidden shadow ring-1 ring-black ring-opacity-5"
                disabled={currentPage * pageSize >= records.length}
                onClick={() => {
                  if (currentPage * pageSize >= records.length) {
                    return
                  }
                  setCurrentPage(currentPage + 1)
                }}
              >
                <ArrowRightIcon className={`h-5 w-5 ${currentPage * pageSize >= records.length ? "text-gray-400" : "text-black"}`} />
              </button>
            </div> : null
          }
        </div> :
        <div className="flex mb-10 justify-center">
          <label className="leading-[200px] font-flow font-medium text-base text-gray-500">
          {isCurrentUser ? "You haven't claimed any DROP yet" : "This account haven't claimed any DROP yet"}
          </label>
        </div>}
    </div>
  )
}