
import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
} from "../../lib/atoms"
import TimeLimitPicker from './TimeLimitPicker'
import ImageSelector from '../toolbox/ImageSelector'

const NamePlaceholder = "DROP NAME"
const DescriptionPlaceholder = "Detail information about this drop"
const URLPlaceholder = "https://the.link.you.want.to.add"

export default function BasicInfoBoard(props) {
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)

  const {
    setBanner, setBannerSize,
    setName, setURL, setDescription,
    timeLockEnabled, setTimeLockEnabled,
    setStartAt, setEndAt
  } = props

  return (
    <>
      <div className="flex flex-col gap-y-10">
        {/** image uploader */}
        <div className="flex flex-col">
          <label className="block text-2xl font-bold font-flow">
            Banner
          </label>
          <label className="block text-md font-flow leading-6 mt-2 mb-2">Image size should be less than 500 KB</label>
          <ImageSelector imageSelectedCallback={(_banner, _bannerSize) => {
            setBanner(_banner)
            setBannerSize(_bannerSize)
          }} />
        </div>

        {/** name */}
        <div className="flex flex-col gap-y-2">
          <label className="block text-2xl font-bold font-flow">
            Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              disabled={transactionInProgress}
              required
              className="bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg rounded-2xl
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
                bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"

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
            Offical Link
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="url"
              id="url"
              disabled={transactionInProgress}
              pattern="[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark rounded-2xl
              bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder={URLPlaceholder}
              onChange={(event) => { setURL(event.target.value) }}
            />
          </div>
        </div>

        <TimeLimitPicker
          timeLockEnabled={timeLockEnabled}
          setTimeLockEnabled={setTimeLockEnabled}
          setStartAt={setStartAt}
          setEndAt={setEndAt}
        />
      </div>
    </>
  )
}