import * as fcl from "@onflow/fcl"
import Image from "next/image"
import { useRouter } from 'next/router'

export default function Landing(props) {
  const router = useRouter()

  return (
    <div className="mt-10 flex gap-y-5 sm:gap-x-5 flex-col-reverse sm:flex-row justify-between items-center">
      <div className="flex flex-col gap-y-8 items-start">
        <div className="flex flex-col gap-y-2">
          <a href="https://cointelegraph.com/news/what-is-a-crypto-airdrop-and-how-does-it-work"
            target="_blank"
            rel="noopener noreferrer">
            <label className={`font-flow text-black font-bold text-5xl sm:text-6xl underline decoration-drizzle-green decoration-3`}>
              Airdrop,
            </label>
          </a>
          <label className={`font-flow text-black font-bold text-5xl sm:text-6xl`}>never been</label>
          <label className={`font-flow text-black font-bold text-5xl sm:text-6xl`}>so easy</label>
        </div>
        <label className={`-mt-5 font-flow text-gray-400 font-medium text-md sm:text-lg`}>
          DROP to your community in one minute
        </label>
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
          {props.user.loggedIn ? "Get Started" : "Connect Wallet"}
        </button>
      </div>

      <div className="w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] relative">
        <Image src="/landing.png" alt="" layout="responsive" width={400} height={400} objectFit="cover" priority />
      </div>
    </div>
  )
}