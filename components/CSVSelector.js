export default function CSVSelector(props) {
  const sample = props.sample || "/sample.csv"
  return (
    <div className="flex items-center gap-x-2">
      <a href={sample} download
        className="text-drizzle-green-dark text-base font-medium"
      >Sample</a>
      <div className="h-12 max-w-[115px] sm:max-w-[140px] px-3 shadow-sm 
      font-medium text-base text-drizzle-green-dark bg-drizzle-green/50
      rounded-2xl overflow-hidden
    hover:bg-drizzle-green-dark hover:text-black"
      >
        <label
          htmlFor="csv-selector"
          className="w-full inline-block text-center leading-[48px] ">
          Upload CSV
        </label>
        <input id="csv-selector" className="invisible " type="file"
          accept=".csv"
          onChange={props.onChange}
        />
      </div>
    </div>
  )
}