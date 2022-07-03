export default function ImageSelector(props) {
  let fileReader

  const handleImageRead = (e) => {
    const content = fileReader.result
    props.imageErrorCallback(null)
    props.imageSelectedCallback(content)
  }
  
  const handleImageChosen = (file) => {
    console.log(file.size)
    if (file.size > 3000000) {
      props.imageErrorCallback("image oversize")
      return false
    } else {
      fileReader = new FileReader()
      fileReader.onloadend = handleImageRead
      fileReader.readAsDataURL(file)
    }
  };

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