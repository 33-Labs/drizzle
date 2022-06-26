import Link from 'next/link'

export default function Banner() {
  return (
    <div className="mt-10 mb-10 flex flex-col items-center gap-y-14">
      <h1 className="p-3 font-flow font-semibold text-5xl text-center">
        An <span className="underline decoration-drizzle-green decoration-4">Airdrop</span> Tool for Everyone on Flow
      </h1>

      <div className="flex gap-x-4">
        <div className="flex flex-col p-4 items-stretch gap-y-6 justify-between basis-1/3 shadow-xl">
          <p className="text-center text-gray-500">distribute specific amount of token to specific accounts</p>
          <Link href="/new_drop">
            <button
              type="button"
              className="h-[60px] px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
              >
              create drop
            </button>
          </Link>
        </div>

        <div className="flex flex-col p-4 items-stretch gap-y-6 justify-between basis-1/3 shadow-xl">
          <p className="text-center text-gray-500">distribute random amount of token to limited accounts in specific group, first come first service</p>
          {/* <Link href="/new_random_packet"> */}
            <button
              type="button"
              className="h-[60px] px-3 text-base font-medium shadow-sm text-black bg-gray-300 hover:bg-gray-400"
              >
              create random packet
            </button>
          {/* </Link> */}
        </div> 

        <div className="flex flex-col p-4 items-stretch gap-y-6 justify-between basis-1/3 shadow-xl">
          <p className="text-center text-gray-500">distribute specific amount of token to limited accounts in specific group, first come first service</p>
          {/* <Link href="/new_random_packet"> */}
            <button
              type="button"
              className="h-[60px] px-3 text-base font-medium shadow-sm text-black bg-gray-300 hover:bg-gray-400"
              >
              create identical packet
            </button>
          {/* </Link> */}
        </div> 
      </div>

    </div>
  )
}