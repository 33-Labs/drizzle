import Image from "next/image"
import { useState } from "react"
import { classNames, convertURI } from "../../lib/utils"

const getRarityColor = (rarityInfo) => {
  if (rarityInfo == "rare") {
    return "text-blue-800 bg-blue-100"
  } else if (rarityInfo == "epic") {
    return "text-yellow-800 bg-yellow-100"
  } else if (rarityInfo == "legendary") {
    return "text-purple-800 bg-purple-100"
  } else {
    return "text-gray-800 bg-gray-100"
  }
}

export default function NFTCard(props) {
  const { tokenID, display, selectedTokens, setSelectedTokens, disabled } = props
  const isDisabled = disabled == true
  const isSelected = (selectedTokens && selectedTokens[tokenID] && selectedTokens[tokenID].isSelected == true) ? true : false

  const thumbnailURI = convertURI(display.thumbnail)
  const thumbnail = (thumbnailURI == "" || !thumbnailURI) ? "/drizzle.png" : thumbnailURI
  const rarityInfo = (display.extraData && (display.extraData["rarityDesc"] || display.extraData["rarityScore"])) || 
    (["common", "rare", "epic", "legendary"].includes(display.description) ? display.description : false) // workaround
  const rarityColor = getRarityColor(rarityInfo) 

  return (
    <div key={tokenID}>
      <div hidden className="text-gray-800 bg-gray-100"></div>
      <div hidden className="text-blue-800 bg-blue-100"></div>
      <div hidden className="text-purple-800 bg-purple-100"></div>
      <div hidden className="text-yellow-800 bg-yellow-100"></div>
      <button className={
        classNames(
          isDisabled ? `w-[124px]` : `w-[136px]`,
          isSelected ? `ring-2 ring-drizzle-green` : `ring-1 ring-black ring-opacity-5`,
          `bg-white h-52 rounded-2xl
        flex flex-col gap-y-1 pb-2 justify-between items-center shrink-0
        overflow-hidden shadow-md `
        )
      }
        disabled={isDisabled}
        onClick={() => {
          if (isDisabled) return
          let tokens = Object.assign({}, selectedTokens)
          if (!tokens[tokenID] || tokens[tokenID].isSelected == false) {
            tokens[tokenID] = { isSelected: true, selectedAt: new Date().getTime(), display: display }
          } else {
            tokens[tokenID] = { isSelected: false, selectedAt: 0, display: display }
          }
          setSelectedTokens(tokens)
        }}>
        <div className="w-full aspect-square bg-drizzle-green-ultralight relative">
          <Image src={thumbnail}
            alt="" layout="fill" priority
            objectFit="cover"
          />
        </div>
        <label className="px-3 max-h-12 overflow-hidden text-ellipsis font-flow font-semibold text-xs text-black">
          {`${display.name}`}
        </label>
        <label className="px-3 font-flow font-medium text-xs text-gray-400">
          {`#${tokenID}`}
        </label>
        {
          (rarityInfo) ?
            <div className={`px-2 ${rarityColor} rounded-full font-flow font-medium text-xs`}>
              {`${rarityInfo}`.toUpperCase()}
            </div> : null
        }
      </button>
    </div>
  )
}