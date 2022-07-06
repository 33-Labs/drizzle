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
    <label>
      <input type="file" accept="image/png, image/jpeg" className="text-sm text-grey-500
        focus:outline-0
        file:mr-5 file:py-2 file:px-6
        file:rounded-full file:border-0
        file:text-sm file:font-medium
        file:bg-drizzle-green/30 file:text-drizzle-green-dark
        hover:file:cursor-pointer hover:file:bg-drizzle-green-dark
        hover:file:text-black
      " onChange={(e) => {handleImageChosen(e.target.files[0])}}/>
  </label>
  )
}