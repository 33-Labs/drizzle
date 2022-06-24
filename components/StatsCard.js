export default function StatsCard() {
  return (
    <>
    <label className="text-2xl font-bold font-flow">stats of this drop</label>
    <div className="mt-5 mb-10 flex justify-between gap-x-2 items-stretch">
      <div className="flex flex-col bg-drizzle-green p-3 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]">
        <label className="text-base font-medium font-flow">
          drop balance
        </label>
        <label className="text-xl font-bold font-flow">500 FLOW</label>
      </div> 

      <div className="flex flex-col bg-drizzle-green p-3 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]">
        <label className="text-base font-medium font-flow">
          claimed token
        </label>
        <label className="text-xl font-bold font-flow">100 FLOW</label>
      </div> 

      <div className="flex flex-col bg-drizzle-green p-3 gap-y-1 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)]">
        <label className="text-base font-medium font-flow">
          claimed count
        </label>
        <label className="text-xl font-bold font-flow">100</label>
      </div> 
    </div>  
    </>
  )
}