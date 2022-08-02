import { useState, useEffect } from "react"
import Image from "next/image"
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid"
import { Combobox } from "@headlessui/react"
import { useRecoilState } from "recoil"

import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionInProgressState,
} from "../lib/atoms"

import { NFTList } from "../flow/nft-list"
import publicConfig from "../publicConfig.js"
import { filterTokenIDs } from "../lib/utils"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function NFTSelector(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress] = useRecoilState(transactionInProgressState)

  const [query, setQuery] = useState("")
  const [selectedNFT, setSelectedNFT] = useState(null)

  const NFTs = NFTList(publicConfig.chainEnv)
  const [rawRecordsStr, setRawRecordsStr] = useState('')
  const [validRecords, setValidRecords] = useState([])
  const [invalidRecords, setInvalidRecords] = useState([])

  const filteredNFTs =
    query === ""
      ? NFTs
      : NFTs.filter((nft) => {
        const content = `${nft.displayName}`
        return content.toLowerCase().includes(query.toLowerCase())
      })

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
          setSelectedNFT(nft)
          props.onNFTSelected(nft)
        }
      }}>

        <div className="relative mt-1">
          <Combobox.Input
            className="w-full h-[50px] text-lg font-flow rounded-2xl border border-drizzle-green bg-drizzle-green/10 py-2 pl-3 pr-10  focus:border-drizzle-green-dark focus:outline-none focus:ring-1 focus:ring-drizzle-green-dark"
            onChange={(event) => {
              setQuery(event.target.value)
            }}
            displayValue={(nft) => nft && `${nft.displayName}`}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          {filteredNFTs.length > 0 && (
            <Combobox.Options className="absolute z-10 rounded-2xl mt-1 max-h-56 w-full overflow-auto  bg-white py-1 text-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {filteredNFTs.map((nft) => (
                <Combobox.Option
                  key={nft.displayName}
                  value={nft}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-3 pr-9",
                      active ? "bg-drizzle-green/50" : "text-black"
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <div className="flex items-center">
                        <div className="w-6 h-6 relative">
                          <Image src={nft.logoURI} alt="" layout="fill" objectFit="cover" className="rounded-full" />
                        </div>
                        <span className={classNames("ml-3 truncate", selected && "font-semibold")}>{`${nft.displayName}`}</span>
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

      {selectedNFT ?
        <div className="flex flex-col mt-1">
          <label className="block text-md font-flow leading-6 mt-2 mb-2">For each line, enter one tokenID. Duplicate tokenIDs are not allowed.</label>
          <textarea
            rows={4}
            name="recipients"
            id="recipients"
            className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark rounded-2xl
            bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
            spellCheck={false}
            value={rawRecordsStr}
            placeholder={
              "1234"
            }
            onChange={(event) => {
              if (validRecords.length > 0 || invalidRecords.length > 0) {
                setValidRecords([])
                setInvalidRecords([])
              }
              setRawRecordsStr(event.target.value)
            }}
          />
          <div className="flex mt-4 gap-x-2 justify-between">
            <button
              type="button"
              className={classNames(
                transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
                "h-12 w-40 px-6 text-base rounded-2xl font-medium shadow-md text-black"
              )}
              disabled={transactionInProgress}
              onClick={() => {
                if (rawRecordsStr.trim().length == 0) {
                  setShowBasicNotification(true)
                  setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: "No tokenIDs provided" })
                  return
                }

                const [valids, invalids] = filterTokenIDs(rawRecordsStr.trim())
                if (invalids.length > 0) {
                  setShowBasicNotification(true)
                  setBasicNotificationContent({ type: "exclamation", title: "Invalid Params", detail: "Invalid tokenIDs or duplicate tokenIDs" })
                  return
                }

                
              }}
            >
              Check
            </button>
          </div>
        </div> : null
      }

    </div>


  )
}
