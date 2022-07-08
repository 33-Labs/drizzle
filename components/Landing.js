import * as fcl from "@onflow/fcl"
import { useRouter } from 'next/router'

export default function Landing(props) {
  const router = useRouter()

  return (
    <div className="mt-10 mb-10 flex flex-col items-center gap-y-14">
      <h1 className="p-3 font-flow font-semibold text-5xl text-center">
        An <span className="underline decoration-drizzle-green decoration-4">Airdrop</span> Tool for Everyone on Flow
      </h1>

      <div className="flex">
        <button
          type="button"
          className="h-12 w-40 px-6 text-base rounded-2xl font-flow font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
          onClick={() => {
            if (props.user.loggedIn) {
              router.push("/new_drop")
            } else {
              fcl.authenticate()
            }
          }}
        >
          {props.user.loggedIn ? "Create DROP" : "Connect Wallet"}
        </button>
      </div>

    </div>
  )
}