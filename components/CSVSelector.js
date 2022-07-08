export default function CSVSelector(props) {
  const sample = props.sample || "/sample.csv"
  return (
    <div className="flex items-center gap-x-2">
      <div className="h-12 max-w-[140px] px-3 shadow-sm 
      font-medium text-base text-drizzle-green-dark bg-drizzle-green/50
      rounded-full
    hover:bg-drizzle-green-dark hover:cursor-pointer hover:text-black"
      >
        <label 
          htmlFor="csv_uploader" 
          className="w-full inline-block text-center leading-[48px] ">
          Upload CSV
        </label>
        <input id="csv_uploader" className="invisible" type="file"
          accept=".csv"
          onChange={props.onChange}
        />
      </div>
      <a href={sample} download
        className="text-drizzle-green-dark text-base font-medium"
      >Sample</a>
    </div>
  )
}