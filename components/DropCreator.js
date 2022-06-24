import TokenSelector from "./TokenSelector"
import Link from 'next/link'

export default function DropCreator() {
  return (
    <>
      <div>
        <h1 className="p-3 mb-10 font-flow font-semibold text-4xl text-center">
          create drop
        </h1>
        {/** name */}
        <label className="block text-2xl font-bold font-flow">
          name
        </label>
        <div className="mt-1 mb-10">
          <input
            type="text"
            name="name"
            id="name"
            className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
            placeholder="the name of this drop"
          />
        </div>

        {/** description */}
        <label className="block text-2xl font-bold font-flow">
          description
        </label>
        <div className="mt-1 mb-10">
          <textarea
            rows={4}
            name="records"
            id="records"
            className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
            defaultValue={''}
            spellCheck={false}
            placeholder={
              "you can input 120 characters at most"
            }
            onChange={(event) => {
              // if event.vaule
            }}
          />
        </div>

        {/** token selector */}
        <TokenSelector 
          className="w-full mb-10" 
        />

        {/** recipients & amounts */}
        <label className="block text-2xl font-bold font-flow">
          recipients & amounts
        </label>
        <label className="block font-flow text-md leading-10">
          For each line, enter one address and the token amount, seperate with comma.
        </label>
        <div className="mt-1 mb-10">
          <textarea
            rows={8}
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
        </div>
        
        {/** create button */}
        <Link href="/0x123/drop/123">
          <button
            type="button"
            className="h-12 w-40 px-6 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            >
            create drop
          </button>
        </Link>
      </div>
    </>
  )
}