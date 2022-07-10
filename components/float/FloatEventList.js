import Image from 'next/image'

export default function FloatEventList(props) {
  const events = props.events

  return (
    <>
      {events.length > 0 ?
        <div className="flex flex-col">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created at
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Groups
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Claimed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {events.map((event) => (
                    <tr key={event.eventId}>
                      <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative bg-[url('/float.png')] bg-center bg-cover rounded-xl">
                            <Image className="rounded-xl" src={event.image == "" ? "/float.png" : `https://ipfs.io/ipfs/${event.image}`} alt="" layout="fill" objectFit="cover" />
                          </div>
                          <div className="ml-4">
                            <label className="block font-medium text-gray-900 break-words max-w-[300px]">{event.name}</label>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-500">
                          {(new Date(parseFloat(event.dateCreated) * 1000)).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-500">
                          {event.groups.toString()}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-500">
                          {Object.keys(event.claimed).length}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div> :
        <div className="flex mb-10 justify-center">
          <label className="leading-[200px] font-flow font-medium text-base text-gray-500">
            {"You haven't created DROP yet"}
          </label>
        </div>}
    </>
  )
}