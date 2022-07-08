import Image from "next/image"
import Link from 'next/link'
import { useRouter } from 'next/router'

import * as fcl from "@onflow/fcl"
import config from "../flow/config.js"
import { LogoutIcon } from "@heroicons/react/outline"

export default function NavigationBar(props) {
  const user = props.user
  const router = useRouter()

  const AuthedState = () => {
    return (
      <div className="flex gap-x-2 items-center">
        <button 
          className="font-flow text-lg underline decoration-drizzle-green decoration-2"
          onClick={() => {
            if (user) {
              router.push(`/${user.addr}`)
            }
          }}
        >
          {user && user.addr}
        </button>
        <button
          type="button"
          className="h-5 w-5"
          onClick={() => {
            fcl.unauthenticate()
            router.push("/")
          }}>
            <LogoutIcon />
        </button>
      </div>
    )
  }
  
  const UnauthenticatedState = () => {
    return (
      <div>
        <button
          type="button"
          className="h-12 w-40 px-6 text-base rounded-2xl font-flow font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
          onClick={fcl.logIn}
          >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="px-6 m-auto max-w-[680px] min-w-[380px] relative gap-x-2 flex items-center justify-between bg-white h-44">
      <div className="flex items-center gap-x-2">
        <Link href="/">
          <div className="min-w-[30px]">
            <Image src="/drizzle.png" alt="" width={50} height={50} priority />
          </div>
        </Link>

        <Link href="/">
          <label className="font-flow font-bold text-3xl">
            drizzle
          </label>
        </Link>
      </div>


      {user.loggedIn
        ? <AuthedState />
        : <UnauthenticatedState />
      }
    </div>
  )
}