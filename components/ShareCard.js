import Image from 'next/image'

export default function ShareCard() {
  return (
    <>
    <label className="text-2xl font-bold font-flow">share this drop</label>
    <div className="h-[100px] shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] mt-5 mb-10 flex items-center">
      <div className="w-[100px] h-[100px] bg-drizzle-green relative shrink-0">
        <Image src="/drizzle.png" alt="" layout="fill" objectFit="cover" />
      </div>
      <div className="px-4">
        <div className="mt-1 flex">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <input
              type="text"
              name="url"
              id="url"
              className="focus:ring-0 focus:border-drizzle-green bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-sm"
              contentEditable={false}
              value={"https://www.drizzle.com"}
            />
          </div>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium  text-gray-700 bg-drizzle-green hover:bg-drizzle-green-dark focus:outline-none"
          >
            <span>copy</span>
          </button>
        </div>
      </div>
      </div>  
    </>
  )
}