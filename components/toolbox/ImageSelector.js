export default function ImageSelector(props) {
  const handleImageChosen = (file) => {
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
    font-medium text-base text-drizzle-green-dark bg-drizzle-green/50
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