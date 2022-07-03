import { useState } from 'react'
import { useRouter } from 'next/router'

import Link from 'next/link'
import { Switch } from '@headlessui/react'
import * as fcl from "@onflow/fcl"

import TokenSelector from "./TokenSelector"
import ReactDatePicker from './DatePicker'
import ImageSelector from './ImageSelector'
import DropCard from './DropCard'
import Decimal from 'decimal.js'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function NDropCreator(props) {
  const router = useRouter()
  const [timeLockEnabled, setTimeLockEnabled] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const [name, setName] = useState("name")
  const [desc, setDesc] = useState("distribute specific amount of token to specific accounts")
  const [token, setToken] = useState({symbol: "FLOW"})

  const [banner, setBanner] = useState(null)
  const [bannerError, setBannerError] = useState(null)

  return (
    <>
      <div className="flex flex-col gap-y-10">
        {/** title */}
        <div>
          <h1 className="font-flow font-semibold text-4xl text-center">
            create nDrop
          </h1>
        </div>

        {/** preview */}
        <div className="flex justify-center">
          <DropCard
            name={name}
            host={props.user.loggedIn ? props.user.addr : "0x0001"}
            createdAt={"2022-12-17 03:48"}
            description={desc}
            amount={1024.2048}
            tokenSymbol={token && token.symbol}
            isPreview={true}
            banner={banner}
          />
        </div>

        {/** image uploader */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            {"banner"}
          </label>
          {bannerError ? 
            <label className="text-red-500">image size should be less than 3MB</label> : null
          }
          <ImageSelector imageSelectedCallback={setBanner} imageErrorCallback={setBannerError}/>
        </div>

        {/** name */}
        <div>
          <label className="block text-2xl font-bold font-flow">
            name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder="the name of this drop"
              onChange={(event) => {
                setName(event.target.value)
              }}
            />
          </div>
        </div>


        {/** description */}
        <div>
          <label className="block text-2xl font-bold font-flow">
            description
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="description"
              id="description"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              defaultValue={''}
              spellCheck={false}
              placeholder={
                "you can input 120 characters at most"
              }
              onChange={(event) => {
                setDesc(event.target.value)
              }}
            />
          </div>
        </div>


        {/** token selector */}
        <div>
          <TokenSelector 
            user={props.user}
            className="w-full" 
            onTokenSelected={setToken}
          />
        </div>


        {/** recipients & amounts */}
        <div>
          <label className="block text-2xl font-bold font-flow">
            recipients & amounts
          </label>
          <label className="block font-flow text-md leading-10">
            For each line, enter one address and the token amount, seperate with comma.
          </label>
          <div className="mt-1">
            <textarea
              rows={8}
              name="recipients"
              id="recipients"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              defaultValue={''}
              spellCheck={false}
              placeholder={
                "0xf8d6e0586b0a20c7,1.6"
              }
              onChange={(event) => {}}
            />
          </div>
        </div>


        {/** time limit */}
        {/* <div>
          <div className="flex justify-between mb-4">
            <label className="block text-2xl font-bold font-flow">
              time limit
            </label>
            <Switch
              checked={timeLockEnabled}
              onChange={setTimeLockEnabled}
              className={classNames(
                timeLockEnabled ? 'bg-drizzle-green' : 'bg-gray-200',
                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle-green'
              )}
            >
              <span className="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                className={classNames(
                  timeLockEnabled ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                )}
              />
            </Switch>
          </div>
          {timeLockEnabled ? 
          <div className="flex justify-between gap-x-2">
            <div className="flex items-center gap-x-2">
              <label className="font-flow font-bold">start</label>
              <ReactDatePicker date={startDate} setDate={setStartDate} />
            </div>

            <div className="flex items-center gap-x-2">
              <label className="font-flow font-bold">end</label>
              <ReactDatePicker date={endDate} setDate={setEndDate} />
            </div>
          </div> : null}
        </div> */}


        
        {/** create button */}
        <div>
          <button
            type="button"
            className="h-12 w-40 px-6 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            onClick={() => {
              if (props.user.loggedIn) {
                router.push("123/drops/456")
                console.log("do create")
              } else {
                fcl.authenticate()
              }
            }}
            >
            {props.user.loggedIn ? "create" : "connect wallet"}
          </button>
        </div>
      </div>
    </>
  )
}