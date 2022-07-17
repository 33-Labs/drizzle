import publicConfig from "../../publicConfig"

const getReviewerTitle = (reviewer) => {
  // Whitelist or WhitelistWithAmount
  if (reviewer.whitelist) {
    return "Whitelist"
  }
  if (reviewer.group) {
    return "FLOAT Group"
  }
  if (reviewer.events) {
    return "FLOAT"
  }
}

const getPacketMode = (packet) => {
  if (packet.totalAmount) return "Random"
  if (packet.amountPerPacket) return "Identical"
  throw "Unknown packet"
}

export default function TagsCard(props) {
  const { tokenInfo, reviewer } = props
  console.log(reviewer)

  return (
    <div className={`flex gap-x-1 mb-2`}>
      {reviewer ?
        <div
          className="px-2 bg-blue-300 rounded-full font-flow font-medium text-sm"
          data-tip="same amount to all users">
          <label>
            {getReviewerTitle(reviewer)}
          </label>
        </div>
        : null
      }

      {reviewer && reviewer.packet ?
        <div
          className="tooltip px-2 bg-yellow-300 rounded-full font-flow font-medium text-sm"
          data-tip="same amount to all users">
          <label>
            {getPacketMode(reviewer.packet)}
          </label>
        </div>
        : null
      }

      <a
        href={`${publicConfig.flowscanURL}/contract/${tokenInfo.tokenIdentifier}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 bg-drizzle-green rounded-full font-flow font-medium text-sm"
      >
        <label>{tokenInfo.symbol}</label>
      </a>
    </div>
  )
}