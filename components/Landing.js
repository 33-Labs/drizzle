import * as fcl from "@onflow/fcl"
import { useRouter } from 'next/router'

export default function Landing(props) {
  const router = useRouter()

  return (
    <div className="mt-10 mb-10 flex flex-col items-center gap-y-14">
      <h1 className="p-3 font-flow font-semibold text-5xl text-center">
        An <span className="underline decoration-drizzle-green decoration-4">Airdrop</span> Tool for Everyone on Flow
      </h1>

      <div className="flex gap-x-4">
        <div className="flex flex-col p-4 items-stretch gap-y-4 justify-between basis-1/3 shadow-xl">
          <label className="font-flow font-bold text-lg text-center">dropN</label>
          <p className="text-center text-gray-500">distribute specific amount of token to specific accounts</p>
          <button
            type="button"
            className="h-12 px-3 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
            onClick={() => {
              if (props.user.loggedIn) {
                router.push("/new_dropn")
              } else {
                fcl.authenticate()
              }
            }}
            >
            {props.user.loggedIn ? "create" : "connect wallet"}
          </button> 
        </div>

        <div className="flex flex-col p-4 items-stretch gap-y-4 justify-between basis-1/3 shadow-xl">
          <label className="font-flow font-bold text-lg text-center">dropR</label>
          <p className="text-center text-gray-500">distribute random amount of token to limited accounts in specific group, first come first service</p>
          {/* <Link href="/new_random_packet"> */}
            <button
              type="button"
              className="h-12 px-3 text-base font-medium shadow-sm text-black bg-gray-300 hover:bg-gray-400"
              >
              coming soon
            </button>
          {/* </Link> */}
        </div> 

        <div className="flex flex-col p-4 items-stretch gap-y-4 justify-between basis-1/3 shadow-xl">
          <label className="font-flow font-bold text-lg text-center">dropI</label>
          <p className="text-center text-gray-500">distribute specific amount of token to limited accounts in specific group, first come first service</p>
          {/* <Link href="/new_random_packet"> */}
            <button
              type="button"
              className="h-12 px-3 text-base font-medium shadow-sm text-black bg-gray-300 hover:bg-gray-400"
              >
              coming soon
            </button>
          {/* </Link> */}
        </div> 
      </div>

    </div>
  )
}