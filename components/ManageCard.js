import Image from 'next/image'

export default function ManageCard() {
  return (
    <>
    <label className="text-2xl font-bold font-flow">manage this drop</label>
      <div className="mt-5 mb-10 shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-y-2 items-center justify-start">
        <div className="w-full flex justify-between gap-x-2">
          <button
            type="button"
            className="min-h-[60px] basis-1/3 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            pause claiming
          </button>
          <button
            type="button"
            className="min-h-[60px] basis-1/3 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            withdraw funds
          </button>
          <button
            type="button"
            className="min-h-[60px] basis-1/3 px-3 text-base font-medium shadow-sm text-black bg-red-400 hover:bg-red-500"
            >
            delete drop
          </button>
        </div>

        <div className="mt-4 w-full items-start">
          <label className="w-full text-lg font-bold font-flow">deposit to drop</label>
        </div>
        <div className="w-full flex justify-between gap-x-2">
            <input
              type="number"
              name="deposit"
              id="deposit"
              className="focus:ring-drizzle-green focus:border-drizzle-green bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-sm" 
            />
          <button
            type="button"
            className="h-12 w-32 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            deposit
          </button>
        </div>
        <div className="mt-4 w-full items-start">
          <label className="w-full text-lg font-bold font-flow">add new claims</label>
        </div>
        <div className="w-full">
          <textarea
            rows={4}
            name="recipients"
            id="recipients"
            className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
            defaultValue={''}
            spellCheck={false}
            placeholder={
              "0xf8d6e0586b0a20c7,1.6"
            }
            onChange={(event) => {}}
          />
          <button
            type="button"
            className="mt-3 h-12 w-24 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            add
          </button>
        </div>

      </div>
    </>
  )
}