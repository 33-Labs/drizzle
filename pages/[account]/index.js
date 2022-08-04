import { useRouter } from 'next/router'
import useSWR from 'swr'
import { SpinnerCircular } from 'spinners-react'

import { useState, useEffect } from 'react'
import DropList from '../../components/DropList'
import Custom404 from '../404'
import { queryDrops } from '../../lib/cloud-scripts'
import RaffleList from '../../components/RaffleList'
import { classNames } from '../../lib/utils'
import { queryRaffles } from '../../lib/mist-scripts'

const convertDrops = (dropMaps) => {
  const dropIDs = Object.keys(dropMaps)
  let drops = []
  for (let i = 0; i < dropIDs.length; i++) {
    const dropID = dropIDs[i]
    const drop = dropMaps[dropID]
    drops.push(drop)
  }

  return drops.sort((a, b) => b.dropID - a.dropID)
}

const convertRaffles = (raffleMaps) => {
  const raffleIDs = Object.keys(raffleMaps)
  let raffles = []
  for (let i = 0; i < raffleIDs.length; i++) {
    const raffleID = raffleIDs[i]
    const raffle = raffleMaps[raffleID]
    raffles.push(raffle)
  }

  return raffles.sort((a, b) => b.raffleID - a.raffleID)
}

const dropsFetcher = async (funcName, address) => {
  return await queryDrops(address)
}

const rafflesFetcher = async (funcName, address) => {
  return await queryRaffles(address)
}

export default function Account(props) {
  const router = useRouter()
  const { account } = router.query

  const [drops, setDrops] = useState([])
  const [raffles, setRaffles] = useState([])
  const { data: dropsData, error: dropsError } = useSWR(
    account ? ["dropsFetcher", account] : null, dropsFetcher)
  const { data: rafflesData, error: rafflesError } = useSWR(
    account ? ["rafflesFetcher", account] : null, rafflesFetcher)
  console.log("raffleData", rafflesData)
  console.log("raffleError", rafflesError)

  const [showDrop, setShowDrop] = useState(true)
  const [showRaffle, setShowRaffle] = useState(false)

  useEffect(() => {
    if (dropsData) {
      setDrops(convertDrops(dropsData))
    }
    if (rafflesData) {
      setRaffles(convertRaffles(rafflesData))
    }
  }, [dropsData, rafflesData])

  const showList = () => {
    if (showDrop) {
      if (!dropsData) {
        return (
          <div className="flex mt-10 h-[200px] justify-center">
            <SpinnerCircular size={50} thickness={180} speed={100} color="#00d588" secondaryColor="#e2e8f0" />
          </div>
        )
      } else {
        return (
          <div className="mt-10">
            <DropList drops={drops} user={props.user} pageAccount={account} /> 
          </div>
        )
        
      }
    }

    if (showRaffle) {
      if (!rafflesData) {
        return (
          <div className="flex mt-10 h-[200px] justify-center">
            <SpinnerCircular size={50} thickness={180} speed={100} color="#00d588" secondaryColor="#e2e8f0" />
          </div>
        )
      } else {
        return (
          <div className="mt-10">
            <RaffleList raffles={raffles} user={props.user} pageAccount={account} />
          </div>
        )
      }
    }
  }

  if ((dropsError && dropsError.statusCode === 400) ||
    (rafflesError && rafflesError.statusCode === 400)) {
    return <Custom404 title={"Account may not exist"} />
  }

  return (
    <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
      <div className="w-full flex justify-center">
        <div className="flex gap-x-1 bg-drizzle-green-light w-80 h-10
        rounded-lg justify-center p-1
        ">
          <button 
            className={classNames(
              showDrop ? "bg-drizzle-green text-black shadow-md" : "bg-drizzle-green-light text-gray-500",
              `basis-1/2 rounded-md font-flow font-semibold`
              )
            }
            onClick={() => {
              if (!showDrop) {
                setShowDrop(true)
                setShowRaffle(false)
              }
            }}
          >
            DROP
          </button>
          <button 
            className={classNames(
              showRaffle ? "bg-drizzle-green text-black shadow-md" : "bg-drizzle-green-light text-gray-500",
              `basis-1/2 rounded-md font-flow font-semibold`
              )
            }
            onClick={() => {
              setShowDrop(false)
              setShowRaffle(true)
            }}
          >
            NFT Raffle
          </button>
        </div>
      </div>

      {showList()}
    </div>
  )
}
