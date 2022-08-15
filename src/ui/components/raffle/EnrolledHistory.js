import { useState } from "react"
import Link from 'next/link'
import { convertCadenceDateTime, displayUsername, getItemsInPage } from '../../lib/utils'
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid"
import { nameServiceState } from "../../lib/atoms"
import { useRecoilState } from "recoil"

const getStatusColor = (status) => {
  if (status == "YES") return "text-green-800 bg-green-100"
  if (status == "NO" || status == "NOT FOUND") return "text-red-800 bg-red-100"
  if (status == "UNKNOWN") return "text-yellow-800 bg-yellow-100"
  return "text-yellow-800 bg-yellow-100"
}

export default function EnrolledHistory(props) {
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
            {`Enrolled Raffles (${records.length})`}
          </h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div hidden className="text-green-800 bg-green-100"></div>
          <div hidden className="text-red-800 bg-red-100"></div>
          <div hidden className="text-yellow-800 bg-yellow-100"></div>
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
                        Reward NFT
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Registered At
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Is Winner?
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Claimed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {getItemsInPage(records, currentPage, pageSize).map((raffle) => (
                      <Link key={`${raffle.raffleID}-link`} href={`${raffle.host.address}/raffles/${raffle.raffleID}`}>
                        <tr key={raffle.raffleID}>
                          <td className="py-4 px-3 text-sm sm:pl-6">
                            <label className="block font-medium text-gray-900 break-words max-w-[300px] min-w-[60px]">{raffle.name}</label>
                          </td>
                          <td className="py-4 px-3 text-sm">
                            <label className="block font-medium text-gray-500 break-words max-w-[300px] min-w-[60px]">{displayUsername(raffle.host, nameService)}</label>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-gray-500">
                            {raffle.nftName}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {convertCadenceDateTime(raffle.registeredAt).toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <label className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(raffle.status)}`}>
                              {raffle.status}
                            </label>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {raffle.claimedAt ? convertCadenceDateTime(raffle.claimedAt).toLocaleString() : null}
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
          {isCurrentUser ? "You haven't enrolled any Raffle yet" : "This account haven't enrolled any Raffle yet"}
          </label>
        </div>}
    </div>
  )
}