import Image from "next/image"
import Link from 'next/link'
import { useRouter } from 'next/router'

import * as fcl from "@onflow/fcl"
import config from "../flow/config.js"
import { LogoutIcon } from "@heroicons/react/outline"
import publicConfig from "../publicConfig.js"
import { useEffect } from "react"
import { displayUsername } from "../lib/utils.js"

import { useRecoilState } from "recoil"
import {
  showBasicNotificationState,
  basicNotificationContentState,
  nameServiceState
} from "../lib/atoms.js"

export default function NavigationBar(props) {
  const user = props.user
  const router = useRouter()
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [nameService, ] = useRecoilState(nameServiceState)

  useEffect(() => {
    window.addEventListener("message", async (d) => {
      if ((d.data.type === "FCL:VIEW:RESPONSE" && d.data.status === "APPROVED" && (d.data.data.network && d.data.data.network !== publicConfig.chainEnv))
        || (d.data.type === "LILICO:NETWORK" && typeof d.data.network === "string" && d.data.network != publicConfig.chainEnv)) {
        setShowBasicNotification(true)
        setBasicNotificationContent({ type: "exclamation", title: "WRONG NETWORK", detail: null })
        await new Promise(r => setTimeout(r, 2))
        fcl.unauthenticate()
      }
    })
  }, [])

  const AuthedState = () => {
    return (
      <div className="shrink truncate flex gap-x-2 items-center">
        <button
          className="shrink truncate font-flow text-base
          text-drizzle-green-dark shadow-sm
          bg-drizzle-green-light rounded-full px-3 py-2 leading-5"
          onClick={() => {
            if (user) {
              router.push(`/${user.addr}`)
            }
          }}
        >
          {user && displayUsername(user, nameService)}
        </button>
        <button
          type="button"
          className="shrink-0 bg-drizzle-green-light rounded-full p-2"
          onClick={() => {
            fcl.unauthenticate()
            router.push("/")
          }}>
          <LogoutIcon className="h-5 w-5 text-drizzle-green-dark" />
        </button>
      </div>
    )
  }

  const UnauthenticatedState = () => {
    return (
      <div>
        <button
          type="button"
          className="h-12 px-6 text-base rounded-2xl font-flow font-semibold shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
          onClick={fcl.logIn}
        >
          <label className="hidden sm:block">Connect Wallet</label>
          <label className="block sm:hidden">Connect</label>
        </button>
      </div>
    )
  }

  return (
    <div className="px-6 m-auto max-w-[920px] min-w-[380px] relative gap-x-5 flex items-center justify-between bg-transparent h-44">
      <div className="flex items-center gap-x-2">
        <Link href="/">
          <div className="min-w-[40px]">
            <Image src="/drizzle.png" alt="" width={50} height={50} priority={true} />
          </div>
        </Link>

        <Link href="/">
          <label className="font-flow font-bold text-3xl">
            drizzle
          </label>
        </Link>
        <label className="hidden sm:block px-1 text-center font-flow text-drizzle-green font-medium text-xs border border-1 border-drizzle-green">
          {`${publicConfig.chainEnv == "mainnet" ? "BETA" : "TESTNET"}`}
        </label>
        <label className="block sm:hidden px-1 text-center font-flow text-drizzle-green font-medium text-xs border border-1 border-drizzle-green">
          {`${publicConfig.chainEnv == "mainnet" ? "BETA" : "T"}`}
        </label>
      </div>

      {user && user.loggedIn
        ? <AuthedState />
        : <UnauthenticatedState />
      }
    </div>
  )
}