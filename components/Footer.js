import Image from "next/image"

export default function Footer() {
  return (
    <footer className="m-auto mt-60 max-w-[880px] min-w-[380px] flex flex-1 justify-center items-center py-8 border-t border-solid box-border">
      <div className="flex flex-col gap-y-2 items-center">
        <div className="min-w-[20px]">
          <Image src="/github.png" alt="" width={20} height={20} priority />
        </div>
        <a
          href="https://github.com/33-Labs"
          target="_blank"
          rel="noopener noreferrer"
          className="font-flow text-sm whitespace-pre"
        >
          Made by <span className="underline font-bold decoration-drizzle-green decoration-2">33Labs</span> with ❤️
        </a>
      </div>

    </footer>
  )
}