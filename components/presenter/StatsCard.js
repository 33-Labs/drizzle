import Decimal from "decimal.js"
import publicConfig from "../../publicConfig"
import { PacketModeRandom } from "../eligibility/PacketModeSelector"

const extractStatsPreview = (packetMode, 
  randomTotalAmount, 
  identicalAmount,
  totalTokenAmount,
  capacity, symbol) => {
  const red = "border-red-400"
  const green = "border-drizzle-green"

  if (!packetMode) {
    const balance = new Decimal(totalTokenAmount)
    return [
      {
        title: "DROP Balance",
        content: `${balance.toString()} ${symbol}`,
        color: balance.isZero() ? red : green
      },
      {
        title: "Claimed Amount",
        content: `0 ${symbol}`,
        color: green
      },
      {
        title: "Claimed Count",
        content: `0`,
        color: green
      }
    ]
  }

  if (packetMode) {
    let balance 
    if (packetMode.key === PacketModeRandom.key) {
      balance = new Decimal(randomTotalAmount)
    } else {
      balance = new Decimal(identicalAmount).mul(new Decimal(capacity))
    }
     
    return [
      {
        title: "DROP Balance",
        content: `${balance.toString()} ${symbol}`,
        color: balance.isZero() ? red : green
      },
      {
        title: `Claimed Amount`,
        content: `0 ${symbol}`,
        color: green
      },
      {
        title: "Claimed Count / Total Capacity",
        content: `0 / ${capacity}`,
        color: green
      }
    ]
  }

  return []
}

const extractStats = (drop) => {
  const distributor = drop.distributor
  const symbol = drop.tokenInfo.symbol
  const claimedCount = Object.keys(drop.claimedRecords).length

  const red = "border-red-400"
  const green = "border-drizzle-green"

  if (distributor.type === "Exclusive") {
    const balance = new Decimal(drop.dropVault.balance)
    return [
      {
        title: "DROP Balance",
        content: `${balance.toString()} ${symbol}`,
        color: balance.isZero() ? red : green
      },
      {
        title: "Claimed Amount",
        content: `${new Decimal(drop.claimedAmount).toString()} ${symbol}`,
        color: green
      },
      {
        title: "Claimed Count",
        content: `${claimedCount}`,
        color: green
      }
    ]
  }

  // Random
  if (distributor.type === "Random") {
    const balance = new Decimal(drop.dropVault.balance)
    return [
      {
        title: "DROP Balance",
        content: `${balance.toString()} ${symbol}`,
        color: balance.isZero() ? red : green
      },
      {
        title: `Claimed Amount`,
        content: `${new Decimal(drop.claimedAmount).toString()} ${symbol}`,
        color: green
      },
      {
        title: "Claimed Count / Total Capacity",
        content: `${claimedCount} / ${distributor.capacity}`,
        color: claimedCount == distributor.capacity ? red : green
      }
    ]
  }

  // Identical 
  if (distributor.type === "Identical") {
    const balance = new Decimal(drop.dropVault.balance)
    return [
      {
        title: "DROP Balance",
        content: `${balance.toString()} ${symbol}`,
        color: balance.isZero() ? red : green
      },
      {
        title: `Claimed Amount`,
        content: `${new Decimal(drop.claimedAmount).toString()} ${symbol}`,
        color: green
      },
      {
        title: "Claimed Count / Total Capacity",
        content: `${claimedCount} / ${distributor.capacity}`,
        color: claimedCount == distributor.capacity ? red : green
      }
    ]
  }
}

const parseClaimed = (claimedRecords) => {
  let claimed = []
  for (let [address, record] of Object.entries(claimedRecords)) {
    const _record = {
      account: address,
      amount: new Decimal(record.amount).toString(),
      rawClaimedAt: parseFloat(record.claimedAt),
      claimedAt: (new Date(parseFloat(record.claimedAt) * 1000)).toLocaleString()
    }
    claimed.push(_record)
  }
  return claimed.sort((a, b) => a.rawClaimedAt - b.rawClaimedAt)
}

export default function StatsCard(props) {
  // isPreview/token for Preview, drop for real data
  const { isPreview, token, packetMode, 
    randomTotalAmount, identicalAmount, totalTokenAmount,
    capacity, drop } = props
  const symbol = (drop && drop.tokenInfo.symbol) || (isPreview && token && token.symbol)

  const claimed = drop ? parseClaimed(drop.claimedRecords) : []
  const cards = drop ? extractStats(drop) : 
    extractStatsPreview(packetMode, randomTotalAmount, identicalAmount, totalTokenAmount, capacity, symbol)
  return (
    <div className="w-full flex flex-col items-center">
      <label className="text-2xl font-bold font-flow">DROP Stats</label>
      <div className="w-full flex flex-col mt-5 mb-5 justify-center gap-y-3 items-stretch
      sm:flex-row sm:gap-x-3">
        {cards.length > 0 ?
          cards.map((card, index) => {
            return (
              <div key={index} className={`w-full rounded-2xl border-4 ${card.color} flex flex-col bg-white px-5 pt-5 pb-10 gap-y-1 shadow-drizzle`}>
                <label className="text-base font-medium font-flow">
                  {card.title}
                </label>
                <label className="text-xl font-bold font-flow">{card.content}</label>
              </div>
            )
          }) : null
        }
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
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Claimed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {
                      claimed.map((claim, index) => (
                        <tr key={index}>
                          <td className="py-3.5 pl-4 pr-3 text-left text-sm sm:pl-6">
                            <a
                              href={`${publicConfig.flowscanURL}/account/${claim.account}`}
                              className="block font-medium text-gray-900 break-words max-w-[200px]"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {claim.account}
                            </a>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.4 text-sm text-gray-500">
                            <div className="text-gray-500">
                              {new Decimal(claim.amount).toString()} {symbol}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.4 text-sm text-gray-500">
                            <div className="text-gray-500">
                              {claim.claimedAt}
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