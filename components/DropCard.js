import Image from "next/image"

export default function DropCard() {
  return (
    <div className="flex flex-col max-w-[360px] min-w-[320px] shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] mt-5 mb-10 items-stretch">
      <div className="w-full h-[200px] bg-drizzle-green relative">
        <Image src="/drizzle.png" alt="" layout="fill" objectFit="cover" />
      </div>
      <div className="w-full px-8 mt-4">
        <label className="text-2xl font-bold font-flow">Hello Drizzle!</label>
      </div>

      <div className="w-full px-8 mb-4">
        <label className="w-full font-flow text-sm text-gray-400">
          by 0x0001, @2022-06-22
        </label>
      </div>

      <div className="w-full px-8 mb-4">
        <p className="w-full font-flow text-sm">
          {`Even before merging it, the main branch will start to fail because, while 0.24.0 is already published, it"s not the most "recent" version. This means the workflow step fails.`}
        </p>
      </div>

      <div className="mt-20 w-full px-8">
        <label className="text-lg font-bold font-flow">YOU ARE ELIGIBLE FOR</label>
      </div>
      <div className="mt-1 w-full px-8">
        <label className="text-2xl font-bold font-flow">100 FLOW</label>
      </div>

      <button
        type="button"
        className="mt-10 mx-8 mb-8 h-[48px] text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
        >
        claim
      </button>
    </div>
  )
}