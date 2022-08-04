const parseWinners = (raffle) => {
  let winners = []
  for (let [address, record] of Object.entries(raffle.winners)) {
    winners.push(record)
  }
  return winners
}

export default function WinnersCard(props) {
  const { isPreiview, raffle } = props
  const winners = raffle ? parseWinners(raffle) : []

  return (
    <div className="w-full flex flex-col">
      <label className="px-3 text-2xl font-bold font-flow">WINNERS</label>
      {winners.length > 0 ?
        <div className="w-full p-4 flex flex-col mb-10">
          <div className="-my-2 -mx-4 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle px-1">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Winner
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Rewards
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        isClaimed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {
                      winners.map((winner, index) => (
                        <tr key={index}>
                          <td className="py-3.5 pl-4 pr-3 text-left text-sm sm:pl-6">
                            <a
                              href={`${publicConfig.flowscanURL}/account/${winner.address}`}
                              className="block font-medium text-gray-900 break-words max-w-[200px]"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {winner.address}
                            </a>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.4 text-sm text-gray-500">
                            <div className="text-gray-500">
                              {winner.rewardTokenIDs.join(", ")}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.4 text-sm text-gray-500">
                            <div className="text-gray-500">
                              {winner.isClaimed}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div> :
        <div className="w-full flex mb-10 items-center justify-center">
          <label className="mt-10 leading-10 font-flow font-medium text-base text-gray-500">
            This Raffle has not been drawn yet
          </label>
        </div>}
    </div>
  )
}