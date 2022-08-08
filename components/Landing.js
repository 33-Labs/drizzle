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
import styles from "../styles/Landing.module.css"

export default function Landing(props) {
  const router = useRouter()
  const [transactionInProgress] = useRecoilState(transactionInProgressState)

  return (
    <div className="flex flex-col gap-y-20">
      <div className="mt-10 flex gap-y-5 sm:gap-x-5 flex-col-reverse sm:flex-row justify-between items-center">
        <div className="px-2 flex flex-col gap-y-8 items-start">
          <div className="flex flex-col gap-y-2">
            <div className={styles.landing}>
              <div className={styles.ltitle}>
                <div className="underline text-black font-bold decoration-drizzle-green decoration-4">Airdrop,</div>
                <div className="underline text-black font-bold decoration-drizzle-green decoration-4">Raffle,</div>
              </div>
            </div>

            <label className={`-mt-1 font-flow text-black font-bold text-5xl sm:text-6xl`}>never been</label>
            <label className={`font-flow text-black font-bold text-5xl sm:text-6xl`}>so easy</label>
          </div>
          <div className="flex flex-col">
            <label className={`-mt-5 font-flow text-gray-400 font-medium text-md`}>
              Create DROP or Raffle in one minute!
            </label>
            <Link href="/about">
              <label className={`cursor-pointer font-flow text-drizzle-green font-medium text-md underline decoration-drizzle-green decoration-3`}>
                Want to know more?
              </label>
            </Link>
          </div>

          {props.user && props.user.loggedIn ?
            <div className="-mt-5 flex flex-col gap-y-2">
              <label className="font-flow text-gray-400 font-medium text-md">Create a new:</label>
              <div className="flex gap-x-2">
                <button
                  type="button"
                  disabled={transactionInProgress}
                  className={classNames(
                    transactionInProgress ? "bg-drizzle-green-light" : "bg-drizzle-green hover:bg-drizzle-green-dark",
                    "h-12 w-32 px-6 text-base rounded-2xl font-flow font-semibold shadow-sm text-black"
                  )}
                  onClick={() => {
                    router.push("/create/ft_drop")
                  }}
                >
                  {"DROP"}
                </button>
                <button
                  type="button"
                  disabled={transactionInProgress}
                  className={classNames(
                    transactionInProgress ? "bg-drizzle-green-light text-gray-400" : "bg-drizzle-green hover:bg-drizzle-green-dark text-black",
                    "h-12 w-32 px-6 text-base rounded-2xl font-flow font-semibold shadow-sm"
                  )}
                  onClick={() => {
                    router.push("/create/nft_raffle")
                  }}
                >
                  {"NFT Raffle"}
                </button>
              </div>
            </div> :
            <button
              type="button"
              disabled={transactionInProgress}
              className={classNames(
                transactionInProgress ? "bg-drizzle-green-light text-gray-400" : "bg-drizzle-green hover:bg-drizzle-green-dark text-black",
                "h-12 px-6 text-base rounded-2xl font-flow font-semibold shadow-sm text-black"
              )}
              onClick={() => { fcl.authenticate() }}
            >
              {"Connect Wallet"}
            </button>
          }
        </div>

        <div className="w-[350px] h-[350px] sm:w-[420px] sm:h-[420px] relative">
          <Image src="/landing.png" alt="" layout="responsive" width={400} height={400} objectFit="cover" priority={true} />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <a href={publicConfig.floatURL}
          target="_blank"
          rel="noopener noreferrer">
          <div className="flex items-center rounded-full bg-drizzle-green-light px-3 py-1 text-xs sm:text-sm text-drizzle-green-dark">
            <Image src="/float_logo.png" alt="" layout="intrinsic" width={20} height={20} objectFit="cover" priority={true} />&nbsp;Eligibility checking with FLOAT is now available!
          </div>
        </a>
      </div>
    </div>
  )
}