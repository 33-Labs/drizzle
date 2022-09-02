import NFTCard from "./NFTCard"

const CardStatus = {
  UNDRAWN: {
    title: "UNDRAWN",
    style: "text-gray-800 bg-gray-100"
  },
  DRAWN: {
    title: "DRAWN",
    style: "text-yellow-800 bg-yellow-100"
  },
  CLAIMED: {
    title: "CLAIMED",
    style: "text-green-800 bg-green-100"
  }
}

const parsePreviewDisplays = (draft) => {
  let displays = Object.assign({}, draft.rewardDisplays)
  for (const [, display] of Object.entries(displays)) {
    if (!display.status) {
      display.status = CardStatus.UNDRAWN
    }
  }
  return displays
}

const parseDisplays = (raffle) => {
  let displays = Object.assign({}, raffle.rewardDisplays)
  for (const [, winnerRecord] of Object.entries(raffle.winners)) {
    const rewardID = winnerRecord.rewardTokenIDs[0]
    const display = displays[rewardID]
    display.status = winnerRecord.isClaimed ? CardStatus.CLAIMED : CardStatus.DRAWN
  }

  for (const [, display] of Object.entries(displays)) {
    if (!display.status) {
      display.status = CardStatus.UNDRAWN
    }
    if (display.name.length == 0) {
      display.name = `${raffle.nftInfo.contractName} #${display.tokenID}`
    }
  }
  return displays
}

export default function RewardCard(props) {
  const { isPreview, raffle, draft } = props
  const displays = isPreview ? parsePreviewDisplays(draft) : (
    raffle ? parseDisplays(raffle) : []
  )

  return (
    <div className="w-full flex flex-col">
      <div hidden className="text-green-800 bg-green-100"></div>
      <div hidden className="text-gray-800 bg-gray-100"></div>
      <div hidden className="text-yellow-800 bg-yellow-100"></div>
      <label className="px-3 text-2xl font-bold font-flow">REWARDS</label>
      {
        Object.keys(displays).length > 0 ?
          <div className={`
          ring-1 ring-black ring-opacity-5
          p-3 bg-white shadow rounded-3xl mt-4 mb-10 grid grid-rows-1 grid-flow-col gap-3 sm:gap-5 justify-start w-full overflow-auto sm:max-h-[450px]
        `}>
            {Object.entries(displays)
              .sort(([tokenID1,], [tokenID2,]) => tokenID2 - tokenID1)
              .map(([tokenID, tokenDisplay]) => {
                return (
                  <div key={`${tokenID}-div`} className="flex flex-col gap-y-2 items-center">
                    <NFTCard
                      key={tokenID}
                      disabled={true}
                      tokenID={tokenID}
                      display={tokenDisplay}
                    />
                    <label key={`${tokenID}-label`} className={`rounded-full px-2 text-xs font-semibold leading-6 ${tokenDisplay.status.style}`}>
                      {tokenDisplay.status.title}
                    </label>
                  </div>
                )
              })
            }
          </div> : null
      }

    </div>
  )
}