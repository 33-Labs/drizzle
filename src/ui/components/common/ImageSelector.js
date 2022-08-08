import { useRecoilState } from "recoil"
import {
  showBasicNotificationState,
  basicNotificationContentState
} from "../../lib/atoms.js"
import publicConfig from "../../publicConfig.js"

export default function ImageSelector(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)

  const handleImageChosen = (file) => {
    if (file.size > publicConfig.bannerSizeLimit) {
      setShowBasicNotification(true)
      setBasicNotificationContent({ type: "exclamation", title: "Image too large", detail: "Should be less than 500KB"})
      return
    }

    if (file) {
      const fileReader = new FileReader()
      fileReader.onloadend = (e) => {
        const content = fileReader.result
        props.imageSelectedCallback(content, file.size)
      }
      fileReader.readAsDataURL(file)
    }
  }

  return (
    <div className="h-12 max-w-[140px] px-3 shadow-sm 
    font-medium text-base text-drizzle-green-dark bg-drizzle-green-light
    rounded-2xl
  hover:bg-drizzle-green-dark hover:text-black"
    >
      <label
        htmlFor="image-selector"
        className="w-full inline-block text-center leading-[48px] ">
        Choose Image
      </label>
      <input id="image-selector" className="hidden w-full" type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => { handleImageChosen(e.target.files[0]) }}
      />
    </div>
  )
}