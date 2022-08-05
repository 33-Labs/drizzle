import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRecoilState } from "recoil"
import {
  transactionInProgressState
} from "../lib/atoms"
import { classNames, convertCadenceDateTime, getRaffleStatus, getVerifierType } from '../lib/utils'

export default function RaffleList(props) {
  const [transactionInProgress] = useRecoilState(transactionInProgressState)
  const router = useRouter()
  const {raffles, user, pageAccount} = props
  let isCurrentUser = false
  if (user && user.addr === pageAccount) {
    isCurrentUser = true
  }

  return (
    <div className="p-2">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {isCurrentUser ?  `My Raffles (${raffles.length})` : `Raffles (${raffles.length})`}
          </h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div hidden className="text-green-800 bg-green-100"></div>
          <div hidden className="text-blue-800 bg-blue-100"></div>
          <div hidden className="text-red-800 bg-red-100"></div>
          <div hidden className="text-yellow-800 bg-yellow-100"></div>
          {
            isCurrentUser ? 
            <button
            type="button"
            disabled={transactionInProgress}
            className={
              classNames(
                transactionInProgress ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
                "inline-flex items-center rounded-2xl justify-center border border-transparent px-4 py-2 text-sm font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-drizzle-green focus:ring-offset-2 sm:w-auto"
              )}
            onClick={() => {
              router.push("/create/nft_raffle")
            }}
          >
            New NFT Raffle
          </button> : null
          }
        </div>
      </div>

      {raffles.length > 0 ?
        <div className="mt-3 flex flex-col w-full">
          <div className="px-1 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        NFT 
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Eligibility
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Winners
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Registrant
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {raffles.map((raffle) => {
                      const status = getRaffleStatus(raffle)
                      raffle.status = status
                      return raffle
                    }).map((raffle) => (
                      <Link key={`${raffle.raffleID}-link`} href={`${raffle.host}/raffles/${raffle.raffleID}`}>
                        <tr key={raffle.raffleID}>
                          <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 relative">
                                <Image className="rounded-xl" src={raffle.image ?? "/flow-banner.jpg"} alt="" layout="fill" objectFit="contain" />
                              </div>
                              <div className="ml-4">
                                <label className="block font-medium text-gray-900 break-words max-w-[300px] min-w-[60px]">{raffle.name}</label>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-gray-500">
                              {raffle.nftInfo.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {getVerifierType(raffle, "RAFFLE")}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {`${Object.keys(raffle.winners).length} / ${raffle.numberOfWinners}`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {`${Object.keys(raffle.registrationRecords).length}`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <label className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${raffle.status.tagColor}`}>
                              {raffle.status.title}
                            </label>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {convertCadenceDateTime(raffle.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      </Link>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div> :
        <div className="flex mb-10 justify-center">
          <label className="leading-[200px] font-flow font-medium text-base text-gray-500">
            {isCurrentUser ?  "You haven't created Raffle yet" : "This account haven't created Raffle yet"}
          </label>
        </div>}
    </div>
  )
}