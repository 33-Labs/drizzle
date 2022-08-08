import Image from "next/image"

export default function Footer() {
  return (
    <footer className="m-auto mt-60 max-w-[920px] flex flex-1 justify-center items-center py-8 border-t border-solid box-border">
      <div className="flex flex-col gap-y-2 items-center">
        <div className="flex gap-x-2">
          <a href="https://github.com/33-Labs/drizzle"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/github.png" alt="" width={20} height={20} priority />
            </div>
          </a>
          <a href="https://lanford33.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/33.png" alt="" width={20} height={20} priority />
            </div>
          </a>
          <a href="https://twitter.com/33_labs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/twitter.png" alt="" width={20} height={20} objectFit="contain" priority />
            </div>
          </a>
          <a href="https://bayou33.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/bayou.png" alt="" width={20} height={20} priority />
            </div>
          </a>
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