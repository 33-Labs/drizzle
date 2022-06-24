import Image from "next/image"
import Link from 'next/link'

export default function NavigationBar() {
  return (
    <div className="px-6 m-auto max-w-[680px] min-w-[380px] relative gap-x-2 flex items-center bg-white h-44">
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

      <button
        type="button"
        className="absolute right-6 h-12 w-40 px-6 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
        onClick={() => {}}
        >
        connect wallet
      </button>
    </div>
  )
}