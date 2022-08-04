import Decimal from "decimal.js"
import publicConfig from "../../publicConfig"
import { PacketModeRandom } from "../eligibility/PacketModeSelector"

// const extractStatsPreview = (packetMode, 
//   randomTotalAmount, 
//   identicalAmount,
//   totalTokenAmount,
//   capacity, symbol) => {
//   const red = "border-red-400"
//   const green = "border-drizzle-green"

//   if (!packetMode) {
//     const balance = new Decimal(totalTokenAmount)
//     return [
//       {
//         title: "DROP Balance",
//         content: `${balance.toString()} ${symbol}`,
//         color: balance.isZero() ? red : green
//       },
//       {
//         title: "Claimed Amount",
//         content: `0 ${symbol}`,
//         color: green
//       },
//       {
//         title: "Claimed Count",
//         content: `0`,
//         color: green
//       }
//     ]
//   }

//   if (packetMode) {
//     let balance 
//     if (packetMode.key === PacketModeRandom.key) {
//       balance = new Decimal(randomTotalAmount)
//     } else {
//       balance = new Decimal(identicalAmount).mul(new Decimal(capacity))
//     }
     
//     return [
//       {
//         title: "DROP Balance",
//         content: `${balance.toString()} ${symbol}`,
//         color: balance.isZero() ? red : green
//       },
//       {
//         title: `Claimed Amount`,
//         content: `0 ${symbol}`,
//         color: green
//       },
//       {
//         title: "Claimed Count / Total Capacity",
//         content: `0 / ${capacity}`,
//         color: green
//       }
//     ]
//   }

//   return []
// }

const extractStats = (raffle) => {
  const green = "border-drizzle-green"

  return [
    {
      title: "NFT",
      content: `${raffle.nftInfo.name}`,
      color: green
    },
    {
      title: "# of Registrant",
      content: `${Object.keys(raffle.registrationRecords).length}`,
      color: green
    },
    {
      title: "Winners (Drawn / Total)",
      content: `${Object.keys(raffle.winners).length} / ${raffle.numberOfWinners}`,
      color: green
    }
  ]
}

export default function RaffleStatsCard(props) {
  // isPreview/token for Preview, raffle for real data
  const { isPreview, raffle } = props
  const cards = raffle ? extractStats(raffle) : []

  return (
    <div className="w-full flex flex-col">
      <label className="px-3 text-2xl font-bold font-flow">DATA</label>
      <div className="w-full flex flex-col mt-4 mb-10 justify-center gap-y-3 items-stretch
      sm:flex-row sm:gap-x-3">
        {cards.length > 0 ?
          cards.map((card, index) => {
            return (
              <div key={index} className={`w-full rounded-2xl ring-1 ring-black ring-opacity-5 overflow-hidden ${card.color} flex flex-col bg-white px-5 pt-5 pb-10 gap-y-1 shadow`}>
                <label className="text-sm font-medium text-gray-500 font-flow">
                  {card.title}
                </label>
                <label className="text-2xl font-bold font-flow text-drizzle-green">{card.content}</label>
              </div>
            )
          }) : null
        }
      </div>
    </div>
  )
}