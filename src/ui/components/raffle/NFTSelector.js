import { useState, useEffect } from "react"
import Image from "next/image"
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid"
import { Combobox } from "@headlessui/react"
import { useRecoilState } from "recoil"

import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
} from "../../lib/atoms"

import { NFTList } from "../../flow/nft-list"
import publicConfig from "../../publicConfig.js"
import { getNFTDisplays } from "../../lib/mist-scripts"
import NFTCard from "./NFTCard"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function NFTSelector(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress] = useRecoilState(transactionInProgressState)

  const [query, setQuery] = useState("")
  const { selectedNFT, setSelectedNFT, selectedTokens, setSelectedTokens } = props

  const NFTs = NFTList(publicConfig.chainEnv)
  const [nftDisplays, setNFTDisplays] = useState({})
  const [filteredNFTs, setFilteredNFTs] = useState([])

  useEffect(() => {
    setFilteredNFTs(
      query === ""
        ? NFTs
        : NFTs.filter((nft) => {
          const content = `${nft.name}`
          return content.toLowerCase().includes(query.toLowerCase())
        }))
  }, [query, NFTs])


  return (
    <div className={"flex flex-col"}>
      <label className="block text-2xl font-flow font-bold">NFT</label>
      {
        props.user && props.user.loggedIn ?
          <label className="block text-md font-flow leading-6 mt-2 mb-2">Select the NFT to add to the Raffle</label>
          : <label className="block text-md font-flow leading-6 mt-2 mb-2">Connect wallet to select NFT</label>
      }

      <Combobox as="div" className={props.className} value={props.user && props.user.loggedIn && selectedNFT} onChange={async (nft) => {
        if (props.user && props.user.loggedIn) {
          if (!selectedNFT || nft.contractName != selectedNFT.contractName || Object.keys(nftDisplays).length == 0) {
            setSelectedNFT(nft)
            setNFTDisplays({})
            setSelectedTokens({})
            getNFTDisplays(props.user.addr, nft).then((displays) => {
              setNFTDisplays(displays)
              if (Object.keys(displays).length == 0) {
                setShowBasicNotification(true)
                setBasicNotificationContent({ type: "exclamation", title: "Empty Collection", detail: "You don't have NFT in the colleciton or the collection isn't linked correctly" })
              }
            })
          }
        }
      }}>

        <div className="relative mt-1">
          <Combobox.Input
            className="w-full h-[50px] text-lg font-flow rounded-2xl border border-drizzle-green bg-drizzle-green-ultralight py-2 pl-3 pr-10  focus:border-drizzle-green-dark focus:outline-none focus:ring-1 focus:ring-drizzle-green-dark"
            onChange={(event) => {
              setQuery(event.target.value)
            }}
            displayValue={(nft) => nft && `${nft.name}`}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          {filteredNFTs.length > 0 && (
            <Combobox.Options className="absolute z-10 rounded-2xl mt-1 max-h-56 w-full overflow-auto  bg-white py-1 text-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {filteredNFTs.map((nft) => (
                <Combobox.Option
                  key={nft.name}
                  value={nft}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-3 pr-9",
                      active ? "bg-drizzle-green-light" : "text-black"
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <div className="flex items-center">
                        <div className="w-6 h-6 relative">
                          <Image src={nft.logoURL} alt="" layout="fill" objectFit="cover" className="rounded-full" />
                        </div>
                        <span className={classNames("ml-3 truncate", selected && "font-semibold")}>{`${nft.name}`}</span>
                      </div>

                      {selected && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                            active ? "text-black" : "text-drizzle-green-dark"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
      {
        Object.keys(nftDisplays).length > 0 ?
          <div className={`
          px-1 py-3 pb-3 mt-4 sm:flex sm:flex-wrap grid grid-rows-2 grid-flow-col gap-3 sm:gap-5 justify-start w-full overflow-auto sm:max-h-[450px]
        `}>
            {Object.entries(nftDisplays)
              .sort(([tokenID1,], [tokenID2,]) => tokenID2 - tokenID1)
              .map(([tokenID, tokenDisplay]) => {
                return (
                  <NFTCard
                    key={tokenID}
                    tokenID={tokenID}
                    display={tokenDisplay}
                    selectedTokens={selectedTokens}
                    setSelectedTokens={setSelectedTokens}
                  />
                )
              })
            }
          </div> : null
      }

      {
        Object.entries(selectedTokens).filter(([, info]) => info.isSelected).length > 0 ?
          <div className="mt-10 flex flex-col p-4 sm:p-8 rounded-3xl border-4 border-drizzle-green-light border-dashed">
            <label className="block text-2xl font-flow font-bold">Selected NFT</label>
            <div className={`
          px-1 py-3 pb-3 mt-4 sm:flex sm:flex-wrap grid grid-rows-2 grid-flow-col gap-3 sm:gap-4 justify-start w-full overflow-auto sm:max-h-[464px]
        `}>
              {Object.entries(selectedTokens)
                .filter(([, info]) => info.isSelected)
                .sort(([, info1], [, info2]) => info1.selectedAt - info2.selectedAt)
                .map(([tokenID,]) => {
                  return (
                    <NFTCard
                      key={tokenID}
                      disabled={true}
                      tokenID={tokenID}
                      display={nftDisplays[tokenID]}
                    />
                  )
                })
              }
            </div>
          </div> : null
      }

    </div>
  )
}
