import * as fcl from "@onflow/fcl"
import Image from "next/image"
import { useRouter } from 'next/router'
import { classNames } from "../lib/utils"
import { useRecoilState } from "recoil"
import Link from "next/link"
import {
  transactionInProgressState
} from "../lib/atoms"
import publicConfig from "../publicConfig"

export default function Landing(props) {
  const router = useRouter()
  const [transactionInProgress] = useRecoilState(transactionInProgressState)

  return (
    <div className="flex flex-col gap-y-20">
      <div className="mt-10 flex gap-y-5 sm:gap-x-5 flex-col-reverse sm:flex-row justify-between items-center">
        <div className="flex flex-col gap-y-8 items-start">
          <div className="flex flex-col gap-y-2">
            <a href="https://cointelegraph.com/news/what-is-a-crypto-airdrop-and-how-does-it-work"
              target="_blank"
              rel="noopener noreferrer">
              <label className={`cursor-pointer font-flow text-black font-bold text-5xl sm:text-6xl underline decoration-drizzle-green decoration-3`}>
                Airdrop,
              </label>
            </a>
            <label className={`font-flow text-black font-bold text-5xl sm:text-6xl`}>never been</label>
            <label className={`font-flow text-black font-bold text-5xl sm:text-6xl`}>so easy</label>
          </div>
          <div className="flex flex-col">
            <label className={`-mt-5 font-flow text-gray-400 font-medium text-md`}>
              DROP to your community in one minute!
            </label>
            <Link href="/about">
              <label className={`cursor-pointer font-flow text-drizzle-green font-medium text-md underline decoration-drizzle-green decoration-3`}>
                Want to know more?
              </label>
            </Link>
          </div>

          <button
            type="button"
            disabled={transactionInProgress}
            className={classNames(
              transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark",
              "h-12 px-6 text-base rounded-2xl font-flow font-semibold shadow-sm text-black"
            )}
            onClick={() => {
              if (props.user.loggedIn) {
                router.push("/create/ft_drop")
              } else {
                fcl.authenticate()
              }
            }}
          >
            {props.user.loggedIn ? "Get Started" : "Connect Wallet"}
          </button>
        </div>

        <div className="w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] relative">
          <Image src="/landing.png" alt="" layout="responsive" width={400} height={400} objectFit="cover" priority={true} />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <a href={publicConfig.floatURL}
          target="_blank"
          rel="noopener noreferrer">
          <div className="flex items-center rounded-full bg-drizzle-green/50 px-3 py-1 text-xs sm:text-sm text-drizzle-green-dark">
            <Image src="/float_logo.png" alt="" layout="intrinsic" width={20} height={20} objectFit="cover" priority={true} />&nbsp;Eligibility checking with FLOAT is now available!
          </div>
        </a>
      </div>
    </div>
  )
}