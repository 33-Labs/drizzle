import React from 'react'
import Image from "next/image"
import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
} from "../../lib/atoms"
import TimeLimitPicker from './TimeLimitPicker'
import ImageSelector from './ImageSelector'

const URLPlaceholder = "https://the.link.you.want.to.add"

const BasicInfoMemoizeBanner = React.memo(({ banner }) => {
  return (
    <div className="w-full rounded-2xl h-[144px] bg-white relative sm:max-w-[460px] ring-1 ring-black ring-opacity-10 overflow-hidden">
      <Image src={banner} alt="" className="rounded-2xl" layout="fill" objectFit="cover" />
    </div>
  )
})
BasicInfoMemoizeBanner.displayName = "BasicInfoMemozieBanner"

export default function BasicInfoBoard(props) {
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)

  const {
    banner, setBanner, setBannerSize,
    setName, setURL, setDescription,
    timeLockEnabled, setTimeLockEnabled,
    setStartAt, setEndAt, NamePlaceholder, DescriptionPlaceholder,
    withTimeLimitPicker
  } = props

  const showTimeLimit = withTimeLimitPicker == true 

  return (
    <>
      <div className="flex flex-col gap-y-10">
        {/** image uploader */}
        <div className="flex flex-col-reverse gap-y-5 sm:flex-row sm:gap-x-12">
          <div className="flex flex-col">
            <label className="block text-2xl font-bold font-flow">
              Banner
            </label>
            <label className="block text-md font-flow leading-6 mt-2 mb-2">Banner size should not be larger than 500 KB. Compress it&nbsp;
              <a href="https://tinypng.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold decoration-drizzle-green decoration-2"
              >
                here
              </a> if you need.</label>
            <ImageSelector imageSelectedCallback={(_banner, _bannerSize) => {
              setBanner(_banner)
              setBannerSize(_bannerSize)
            }} />
          </div>
          <BasicInfoMemoizeBanner banner={banner || "/banner.png"} />
        </div>

        {/** name */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Name<span className="text-red-600">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              disabled={transactionInProgress}
              required
              className="bg-drizzle-green-ultralight block w-full border-drizzle-green font-flow text-lg rounded-2xl
                focus:ring-drizzle-green-dark focus:border-drizzle-green-dark  placeholder:text-gray-300"
              placeholder={NamePlaceholder}
              onChange={(event) => {
                setName(event.target.value)
              }}
            />
          </div>
        </div>

        {/** description */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Description
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="description"
              id="description"
              disabled={transactionInProgress}
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark rounded-2xl
                bg-drizzle-green-ultralight resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"

              defaultValue={''}
              spellCheck={false}
              placeholder={DescriptionPlaceholder}
              onChange={(event) => { setDescription(event.target.value) }}
            />
          </div>
        </div>

        {/** url */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Official Link
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="url"
              id="url"
              disabled={transactionInProgress}
              pattern="[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark rounded-2xl
              bg-drizzle-green-ultralight block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder={URLPlaceholder}
              onChange={(event) => { setURL(event.target.value) }}
            />
          </div>
        </div>
        {showTimeLimit ? 
        <TimeLimitPicker
          timeLockEnabled={timeLockEnabled}
          setTimeLockEnabled={setTimeLockEnabled}
          setStartAt={setStartAt}
          setEndAt={setEndAt}
        /> : null}
      </div>
    </>
  )
}