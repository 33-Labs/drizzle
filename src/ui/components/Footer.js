import Image from "next/image"
import { useEffect, useState } from "react"
import { NameService } from "../lib/utils";
import { useRecoilState } from "recoil"
import { nameServiceState } from "../lib/atoms";

export default function Footer() {
  const [nameService, setNameService] = useRecoilState(nameServiceState)

  useEffect(() => {
    if (nameService != null) {
      localStorage.setItem('PreferredNameService', nameService);
    }
  }, [nameService]);

  useEffect(() => {
    const _nameService = localStorage.getItem('PreferredNameService')
    if (_nameService) {
      setNameService(_nameService)
    }
  }, [])

  return (
    <footer className="m-auto mt-60 max-w-[920px] flex flex-1 justify-center items-center py-8 border-t border-solid box-border">
      <div className="flex flex-col gap-y-2 items-center">
        <div
          className="flex gap-x-2 items-center font-flow text-sm mb-5 -mt-3"
        >
          <label>
            Preferred Name Service
          </label>
          <button
            type="button" 
            className={`rounded-2xl px-2 py-1 bg-drizzle-green hover:bg-drizzle-green-dark font-bold`}
            onClick={() => {
              if (!nameService || nameService == NameService.find) {
                setNameService(NameService.flowns)
              } else if (nameService == NameService.flowns) {
                setNameService(NameService.find)
              }
            }}
          >
            {nameService}
          </button>
        </div>
        <div className="flex gap-x-2">
          <a href="https://github.com/33-Labs/drizzle"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/github.png" alt="" width={20} height={20} />
            </div>
          </a>
          <a href="https://lanford33.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/33.png" alt="" width={20} height={20} />
            </div>
          </a>
          <a href="https://twitter.com/33_labs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/twitter.png" alt="" width={20} height={20} objectFit="contain" />
            </div>
          </a>
          <a href="https://bayou33.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/bayou.png" alt="" width={20} height={20} />
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
        <a
          href="https://discord.gg/vE9fQ35Y"
          target="_blank"
          rel="noopener noreferrer"
          className="font-flow text-sm whitespace-pre"
        >
           Get support on <span className="underline font-bold decoration-drizzle-green decoration-2">Emerald City DAO</span>
        </a>
      </div>

    </footer>
  )
}