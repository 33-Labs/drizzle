import Decimal from "decimal.js"

const convertClaimedObjectToList = (claimed) => {
  const list = []
  for (let [key, value] of Object.entries(claimed)) {
    const record = {account: key, amount: (new Decimal(value)).toString()}
    list.push(record)
  }
  console.log("list ", list)
  return list
}

export default function StatsCard(props) {
  const claimed = convertClaimedObjectToList(props.claimed || {})

  return (
    <div className="w-full flex flex-col items-center">
      <label className="text-2xl font-bold font-flow">DROP Stats</label>
      <div className="w-full mt-5 mb-5 flex justify-center gap-x-3 items-stretch">
        <div className="basis-1/4 rounded-2xl ring-1 ring-black ring-opacity-5 flex flex-col bg-drizzle-green px-5 pt-5 pb-10 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]">
          <label className="text-base font-medium font-flow">
            Drop Balance
          </label>
          <label className="text-xl font-bold font-flow">500 FLOW</label>
        </div>

        <div className="basis-1/4 rounded-2xl ring-1 ring-black ring-opacity-5 flex flex-col bg-drizzle-green px-5 pt-5 pb-10 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]">
          <label className="text-base font-medium font-flow">
            Claimed Amount
          </label>
          <label className="text-xl font-bold font-flow">100 FLOW</label>
        </div>

        <div className="basis-1/4 rounded-2xl ring-1 ring-black ring-opacity-5 flex flex-col bg-drizzle-green px-5 pt-5 pb-10 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]">
          <label className="text-base font-medium font-flow">
            Claimed Count
          </label>
          <label className="text-xl font-bold font-flow">100</label>
        </div>
      </div>
      <div className="w-full p-4 flex flex-col mb-10">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle px-4">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Claimer
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {claimed.map((claim) => (
                    <tr key={claim.account}>
                      <td className="py-3.5 pl-4 pr-3 text-left text-sm sm:pl-6">
                        <label className="block font-medium text-gray-900 break-words max-w-[200px]">{claim.account}</label>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.4 text-sm text-gray-500">
                        <div className="text-gray-500">
                          {claim.amount}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}