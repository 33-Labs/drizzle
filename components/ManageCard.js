export default function ManageCard() {
  return (
    <>
    <label className="text-2xl font-bold font-flow">Manage DROP</label>
      <div className="w-full mt-5 mb-10 
        overflow-hidden ring-1 ring-black ring-opacity-5 rounded-2xl
        shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] 
        p-6 flex flex-col gap-y-2 items-center justify-start">
        <div className="w-full flex justify-between gap-x-3">
          <button
            type="button"
            className="rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            Pause
          </button>
          <button
            type="button"
            className="rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            Withdraw Funds 
          </button>
          <button
            type="button"
            className="rounded-xl min-h-[60px] basis-1/3 px-3 text-base font-medium shadow text-black bg-red-400 hover:bg-red-500"
            >
            Delete
          </button>
        </div>

        <div className="mt-4 w-full items-start">
          <label className="w-full text-lg font-bold font-flow">Funding DROP</label>
        </div>
        <div className="w-full flex justify-between gap-x-3">
            <input
              type="number"
              name="deposit"
              id="deposit"
              className="rounded-xl focus:ring-drizzle-green focus:border-drizzle-green bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-sm" 
            />
          <button
            type="button"
            className="rounded-xl h-12 w-32 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            Deposit
          </button>
        </div>
        <div className="mt-4 w-full items-start">
          <label className="w-full text-lg font-bold font-flow">Add new claims</label>
        </div>
        <div className="w-full">
          <textarea
            rows={4}
            name="recipients"
            id="recipients"
            className="rounded-xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
            defaultValue={''}
            spellCheck={false}
            placeholder={
              "0xf8d6e0586b0a20c7,1.6"
            }
            onChange={(event) => {}}
          />
          <button
            type="button"
            className="rounded-xl mt-4 h-12 w-24 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            Add
          </button>
        </div>

      </div>
    </>
  )
}