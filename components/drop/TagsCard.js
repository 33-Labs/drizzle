import publicConfig from "../../publicConfig"

const getReviewerTitle = (reviewer) => {
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

      {reviewer  ?
        <div
          className="tooltip px-2 bg-yellow-300 rounded-full font-flow font-medium text-sm"
          data-tip="same amount to all users">
          <label>
            {"Identical"}
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