import Decimal from "decimal.js"

const parseClaimed = (claimed) => {
  const list = []
  let totalAmount = new Decimal(0)
  for (let [key, value] of Object.entries(claimed)) {
    const amount = new Decimal(value)
    totalAmount = totalAmount.add(amount)
    const record = { account: key, amount: amount.toString() }
    list.push(record)
  }
  return [list, totalAmount]
}

export default function StatsCard(props) {
  const stats = props.stats
  const [claimed, totalAmount] = parseClaimed((stats && stats.claimed) || {})
  const symbol = stats && stats.tokenSymbol

  let balance = "NaN"
  let runOut = false
  if (stats) {
    let b = new Decimal(stats.dropBalance)
    balance = b.toString()
    if (b.isZero()) {
      runOut = true
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <label className="text-2xl font-bold font-flow">DROP Stats</label>
      <div className="w-full flex flex-col mt-5 mb-5 justify-center gap-y-3 items-stretch
      sm:flex-row sm:gap-x-3">
        <div className={`w-full rounded-2xl border-4 ${runOut ? "border-red-400" : "border-drizzle-green"} flex flex-col bg-white px-5 pt-5 pb-10 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]`}>
          <label className="text-base font-medium font-flow">
            Drop Balance
          </label>
          <label className="text-xl font-bold font-flow">{balance} {symbol}</label>
        </div>

        <div className="w-full rounded-2xl border-4 border-drizzle-green flex flex-col bg-white px-5 pt-5 pb-10 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]">
          <label className="text-base font-medium font-flow">
            Claimed Amount
          </label>
          <label className="text-xl font-bold font-flow">{totalAmount.toString()} {symbol}</label>
        </div>

        <div className="w-full rounded-2xl border-4 border-drizzle-green flex flex-col bg-white px-5 pt-5 pb-10 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]">
          <label className="text-base font-medium font-flow">
            Claimed Count
          </label>
          <label className="text-xl font-bold font-flow">{claimed.length}</label>
        </div>
      </div>

      {claimed.length > 0 ?
        <div className="w-full p-4 flex flex-col mb-10">
          <div className="-my-2 -mx-4 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle px-1">
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
                            {claim.amount} {symbol}
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
        <div className="mb-10">
          <label className="leading-10 font-flow font-medium text-base text-gray-500">
            This DROP has not been claimed yet
          </label>
        </div>}
    </div>

  )
}