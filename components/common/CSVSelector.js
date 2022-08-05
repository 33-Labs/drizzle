export default function CSVSelector(props) {
  const sample = props.sample || "/ra_sample.csv"
  return (
    <div className="shrink flex items-center gap-x-2">
      <a href={sample} download
        className="text-drizzle-green-dark text-base font-medium"
      >Sample</a>
      <div className="h-12 px-3 shadow-sm 
      font-medium text-base text-drizzle-green-dark bg-drizzle-green-light
      rounded-2xl 
    hover:bg-drizzle-green-dark hover:text-black"
      >
        <label
          htmlFor="csv-selector"
          className="hidden sm:inline-block w-full text-center leading-[48px] ">
          Upload CSV
        </label>
        <label
          htmlFor="csv-selector"
          className="inline-block sm:hidden w-full text-center leading-[48px] ">
          Upload
        </label>
        <input id="csv-selector" className="hidden w-full" type="file"
          accept=".csv"
          onChange={props.onChange}
        />
      </div>
    </div>
  )
}