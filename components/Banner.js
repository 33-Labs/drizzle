import Link from 'next/link'

export default function Banner() {
  return (
    <div className="mt-10 mb-10 flex flex-col items-center gap-y-8">
      <h1 className="p-3 font-flow font-semibold text-5xl text-center">
        An <span className="underline decoration-drizzle-green decoration-4">Airdrop</span> Tool for Everyone on Flow
      </h1>

      <Link href="/new_drop">
        <button
          type="button"
          className="h-12 w-40 px-6 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
          >
          create drop
        </button>
      </Link>
    </div>
  )
}