import * as fcl from "@onflow/fcl"
import { useRouter } from 'next/router'

export default function Landing(props) {
  const router = useRouter()

  return (
    <div className="mt-10 p-7 sm:p-10
    shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.2)] rounded-3xl overflow-hidden
    ring-1 ring-black ring-opacity-5
    bg-[url('/flow-banner.jpg')] bg-cover bg-center">

      <div className="
       ring-1 ring-black ring-opacity-5
       rounded-3xl overflow-hidden
      w-full p-10 flex flex-col gap-y-14 items-center bg-white/[0.98]">
        <h1 className="p-3 font-flow font-semibold text-4xl sm:text-5xl text-center">
          An <span className="underline decoration-drizzle-green decoration-4">Airdrop</span> Tool for Everyone
        </h1>

        <div className="flex">
          <button
            type="button"
            className="h-12 px-6 text-base rounded-2xl font-flow font-semibold shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
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


    </div>
  )
}