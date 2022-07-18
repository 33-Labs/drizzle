import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { convertCadenceDateTime, getDropStatus, getEligibilityMode, getPacket } from '../lib/utils'

export default function DropList(props) {
  const router = useRouter()
  const drops = props.drops

  return (
    <div className="p-2">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">My DROPs ({drops.length})</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div hidden className="text-green-800 bg-green-100"></div>
          <div hidden className="text-blue-800 bg-blue-100"></div>
          <div hidden className="text-red-800 bg-red-100"></div>
          <div hidden className="text-yellow-800 bg-yellow-100"></div>
          <button
            type="button"
            className="inline-flex items-center rounded-2xl justify-center border border-transparent bg-drizzle-green px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-drizzle-green-dark focus:outline-none focus:ring-2 focus:ring-drizzle-green focus:ring-offset-2 sm:w-auto"
            onClick={() => {
              router.push("/create")
            }}
          >
            New
          </button>
        </div>
      </div>

      {drops.length > 0 ?
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
                        Token
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Eligibility
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Mode
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
                    {drops.map((drop) => {
                      const status = getDropStatus(drop)
                      drop.status = status
                      return drop
                    }).map((drop) => (
                      <Link key={`${drop.dropID}-link`} href={`${props.user.addr}/drops/${drop.dropID}`}>
                        <tr key={drop.dropID}>
                          <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 relative">
                                <Image className="rounded-xl" src={drop.image ?? "/flow-banner.jpg"} alt="" layout="fill" objectFit="cover" />
                              </div>
                              <div className="ml-4">
                                <label className="block font-medium text-gray-900 break-words max-w-[300px]">{drop.name}</label>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-gray-500">
                              {drop.tokenInfo.symbol}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {getEligibilityMode(drop)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {getPacket(drop)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <label className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${drop.status.tagColor}`}>
                              {drop.status.title}
                            </label>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {convertCadenceDateTime(drop.createdAt).toLocaleString()}
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
            {"You haven't created DROP yet"}
          </label>
        </div>}
    </div>
  )
}