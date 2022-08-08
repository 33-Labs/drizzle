import publicConfig from "../../publicConfig"

const extractStatsPreview = (draft) => {
  const green = "border-drizzle-green"

  return [
    {
      title: "NFT",
      content: `${draft.nftInfo.name}`,
      color: green,
      link: `${publicConfig.flowscanURL}/contract/A.${draft.nftInfo.contractAddress.replace("0x", "")}.${draft.nftInfo.contractName}`
    },
    {
      title: "# of Registrants",
      content: `0`,
      color: green,
      link: null
    },
    {
      title: "Winners (Drawn / Total)",
      content: `0 / ${draft.numberOfWinners}`,
      color: green,
      link: null
    }
  ]
}

const extractStats = (raffle) => {
  const green = "border-drizzle-green"

  return [
    {
      title: "NFT",
      content: `${raffle.nftInfo.name}`,
      color: green,
      link: `${publicConfig.flowscanURL}/contract/A.${raffle.nftInfo.contractAddress.replace("0x", "")}.${raffle.nftInfo.contractName}`
    },
    {
      title: "# of Registrants",
      content: `${Object.keys(raffle.registrationRecords).length}`,
      color: green,
      link: null
    },
    {
      title: "Winners (Drawn / Total)",
      content: `${Object.keys(raffle.winners).length} / ${raffle.numberOfWinners}`,
      color: green,
      link: null
    }
  ]
}

export default function RaffleStatsCard(props) {
  const { isPreview, raffle, draft } = props
  const cards = isPreview ? extractStatsPreview(draft) : (raffle ? extractStats(raffle) : [])

  return (
    <div className="w-full flex flex-col">
      <label className="px-3 text-2xl font-bold font-flow">DATA</label>
      <div className="w-full flex flex-col mt-4 mb-10 justify-center gap-y-3 items-stretch
      sm:flex-row sm:gap-x-3">
        {cards.length > 0 ?
          cards.map((card, index) => {
            return (
              <div key={`${index}-div`} className="w-full">
                {
                  card.link ?
                    <a
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div key={index} className={`cursor-pointer h-full w-full rounded-2xl ring-1 ring-black ring-opacity-5 overflow-hidden ${card.color} flex flex-col bg-white px-5 pt-5 pb-10 gap-y-1 shadow`}>
                        <label className="cursor-pointer text-sm font-medium text-gray-500 font-flow">
                          {card.title}
                        </label>
                        <label className="cursor-pointer text-2xl font-bold font-flow text-drizzle-green">{card.content}</label>
                      </div>
                    </a> :
                    <div key={index} className={`h-full w-full rounded-2xl ring-1 ring-black ring-opacity-5 overflow-hidden ${card.color} flex flex-col bg-white px-5 pt-5 pb-10 gap-y-1 shadow`}>
                      <label className="text-sm font-medium text-gray-500 font-flow">
                        {card.title}
                      </label>
                      <label className="text-2xl font-bold font-flow text-drizzle-green">{card.content}</label>
                    </div>
                }
              </div>)

          }) : null
        }
      </div>
    </div>
  )
}