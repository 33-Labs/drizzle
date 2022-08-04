import Decimal from "decimal.js"
import publicConfig from "../../publicConfig"
import { PacketModeRandom } from "../eligibility/PacketModeSelector"
import NFTCard from "../NFTCard"

export default function RewardCard(props) {
  const {nftDisplays} = props
  let displays = Object.assign({}, nftDisplays)
  // for (let i = 0; i < Object.keys(nftDisplays).length; i++) {
  //   let tokenIDs = Object.keys(nftDisplays)
  //   let tokenID = tokenIDs[i]
  //   let display = displays[tokenID]
  //   displays[tokenID + i] = display
  //   displays[tokenID + i + i] = display
  // }
  console.log(displays)
  return (
    <div className="w-full flex flex-col">
      <label className="px-3 text-2xl font-bold font-flow">REWARDS</label>
      {
        Object.keys(displays).length > 0 ?
          <div className={`
          p-3 bg-white shadow-drizzle rounded-3xl mt-4 mb-10 grid grid-rows-1 grid-flow-col gap-3 sm:gap-5 justify-start w-full overflow-auto sm:max-h-[450px]
        `}>
            {Object.entries(displays)
              .sort(([tokenID1,], [tokenID2,]) => tokenID2 - tokenID1)
              .map(([tokenID, tokenDisplay]) => {
                return (
                  <NFTCard
                    key={tokenID}
                    disabled={true}
                    tokenID={tokenID}
                    display={tokenDisplay}
                  />
                )
              })
            }
          </div> : null
      }

    </div>
  )
}