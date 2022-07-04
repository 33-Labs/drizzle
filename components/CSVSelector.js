export default function CSVSelector(props) {
  const handleCSVChosen = (file) => {
    console.log(file.size)
    const fileReader = new FileReader()
    fileReader.onloadend = (e) => {
      const content = fileReader.result
      props.csvSelectedCallback(content)
    }
    fileReader.readAsText(file)
  }

  return (
    <label>
      <input type="file" accept="csv" className="text-sm text-grey-500
        focus:outline-0
        file:mr-5 file:py-2 file:px-6
        file:rounded-full file:border-0
        file:text-sm file:font-medium
        file:bg-drizzle-green/30 file:text-drizzle-green-dark
        hover:file:cursor-pointer hover:file:bg-drizzle-green-dark
        hover:file:text-black
      " onChange={(e) => {handleCSVChosen(e.target.files[0])}}/>
  </label>
  )
}