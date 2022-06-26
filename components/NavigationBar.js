import Image from "next/image"
import Link from 'next/link'

import * as fcl from "@onflow/fcl"
import config from "../flow/config.js"
import publicConfig from "../publicConfig.js"

export default function NavigationBar(props) {
  const user = props.user

  const AuthedState = () => {
    return (
      <div className="flex gap-x-2 items-center">
        <label> 
          <a 
            href={`${publicConfig.flowscanURL}/account/${user?.addr ?? "No Address"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-flow text-lg underline decoration-drizzle-green decoration-2">{user?.addr ?? "No Address"}
          </a>
        </label>
        <button
          type="button"
          className="h-12 w-10 px-1 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
          onClick={fcl.unauthenticate}
          >
            {"->"}
        </button>
      </div>
    )
  }
  
  const UnauthenticatedState = () => {
    return (
      <div>
        <button
          type="button"
          className="h-12 w-40 px-6 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
          onClick={fcl.logIn}
          >
          connect wallet
        </button>
      </div>
    )
  }

  return (
    <div className="px-6 m-auto max-w-[680px] min-w-[380px] relative gap-x-2 flex items-center justify-between bg-white h-44">
      <div className="flex items-center gap-x-2">
        <Link href="/">
          <div>
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