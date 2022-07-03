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

function isValidHttpUrl(string) {
  let url
  
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === "http:" || url.protocol === "https:"
}

export default function DropNCreator(props) {
  const router = useRouter()
  const [timeLockEnabled, setTimeLockEnabled] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const namePlaceholder = "The name of this drop"
  const [name, setName] = useState(null)
  const descPlaceholder = "Detail information about this drop"
  const [desc, setDesc] = useState("")
  const [url, setURL] = useState(null)
  const [token, setToken] = useState(null)

  const [banner, setBanner] = useState(null)
  const [bannerSize, setBannerSize] = useState(0)

  const [paramsError, setParamsError] = useState(null)

  const checkParams = () => {
    if (!name || name.trim() == "") {
      return [false, "invalid name"]
    }

    if (url && !isValidHttpUrl(url)) {
      return [false, "invalid url"]
    }

    if (!token) {
      return [false, "invalid token"]
    }

    if (bannerSize > 1000000) {
      return [false, "banner oversize"]
    }

    return [true, null]
  }

  const handleSubmit = (event) => {
    if (props.user && props.user.loggedIn) {
      const [valid, error] = checkParams()
      if (valid) {
        router.push("/123/drops/456")
      } else {
        setParamsError(error)
      }
    } else {
      fcl.authenticate()
    }
  }

  return (
    <>
        {/** title */}
        <h1 className="font-flow font-semibold text-4xl text-center mb-10">
          create dropN
        </h1>

        {/** preview */}
        <div className="flex justify-center mb-10">
          <DropCard
            name={name ? name : namePlaceholder}
            host={props.user.loggedIn ? props.user.addr : "0x0001"}
            createdAt={"2022-12-17 03:48"}
            description={desc ? desc : descPlaceholder}
            amount={1024.2048}
            tokenSymbol={token ? token.symbol : "FLOW"}
            isPreview={true}
            banner={banner}
          />
        </div>

        <div className="flex flex-col gap-y-10">

        {/** image uploader */}
        <div className="flex flex-col gap-y-1">
          <label className="block text-2xl font-bold font-flow">
            {"banner"}
          </label>
          {/** The transaction limit of flow is 1.5 MB */}
          <label className="block text-md font-flow leading-10">image size should be less than 1 MB</label>
          <ImageSelector imageSelectedCallback={(_banner, _bannerSize) => {
            setBanner(_banner)
            setBannerSize(_bannerSize)
          }} />
        </div>

        {/** name */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder="the name of this drop"
              onChange={(event) => {
                setName(event.target.value)
              }}
            />
          </div>
        </div>


        {/** description */}
        <div className="flex flex-col gap-y-2">
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
                "detail information about this drop"
              }
              onChange={(event) => {
                setDesc(event.target.value)
              }}
            />
          </div>
        </div>

        {/** url */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            url
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="url"
              id="url"
              pattern="[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder="the link about this drop"
              onChange={(event) => {
                setURL(event.target.value)
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
        <div className="flex gap-x-4 items-center">
          <button
            type="button"
            className="h-12 w-40 px-6 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            onClick={handleSubmit}
            >
            {props.user.loggedIn ? "create" : "connect wallet"}
          </button>
          {
            paramsError ?
            <label className="font-flow text-md text-red-500">{paramsError}</label> : null
          }
        </div>
        </div>
    </>
  )
}