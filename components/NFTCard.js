import Image from "next/image"
import { useState } from "react"
import { classNames, convertURI } from "../lib/utils"

export default function NFTCard(props) {
  const { tokenID, display, selectedTokens, setSelectedTokens, disabled } = props
  const isDisabled = disabled == true
  const isSelected = (selectedTokens && selectedTokens[tokenID] && selectedTokens[tokenID].isSelected == true) ? true : false

  const thumbnailURI = convertURI(display.thumbnail)
  const thumbnail = (thumbnailURI == "" || !thumbnailURI) ? "/drizzle.png" : thumbnailURI

  return (
    <div key={tokenID}>
    <button className={
      classNames(
        isDisabled ? `w-[124px]` : `w-[136px]`,
        isSelected ? `ring-2 ring-drizzle-green` : `ring-1 ring-black ring-opacity-5`,
        `bg-white h-48 rounded-2xl
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
      <div className="w-full h-28 bg-drizzle-green/10 relative">
        <Image src={thumbnail}
          alt="" layout="fill" priority
          objectFit="contain"
        />
      </div>
      <label className="px-3 max-h-12 overflow-hidden text-ellipsis font-flow font-semibold text-xs text-black">
        {`${display.name}`}
      </label>
      <label className="px-3 font-flow font-medium text-xs text-gray-400">
        {`#${tokenID}`}
      </label>
    </button>
    </div>
  )
}