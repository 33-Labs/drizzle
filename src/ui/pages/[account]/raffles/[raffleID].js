import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { SpinnerCircular } from 'spinners-react'

import Custom404 from '../../404'
import { queryRaffle, queryClaimStatus } from '../../../lib/mist-scripts'
import RafflePresenter from '../../../components/raffle/RafflePresenter'

const raffleFetcher = async (funcName, raffleID, host) => {
  return await queryRaffle(raffleID, host)
}

const raffleClaimStatusFetcher = async (funcName, raffleID, host, claimer) => {
  return await queryClaimStatus(raffleID, host, claimer)
}

export default function Raffle(props) {
  const router = useRouter()
  const { account, raffleID } = router.query
  const host = account
  const user = props.user

  const [raffle, setRaffle] = useState(null)
  const [claimStatus, setClaimStatus] = useState(null)

  const { data: raffleData, error: raffleError } = useSWR(
    raffleID && host ? ["raffleFetcher", raffleID, host] : null, raffleFetcher)

  const { data: claimStatusData, error: claimStatusError } = useSWR(
    raffleID && host && user && user.loggedIn ? ["raffleClaimStatusFetcher", raffleID, host, user.addr] : null, raffleClaimStatusFetcher)

  useEffect(() => {
    if (raffleData) { setRaffle(raffleData) }
    if (claimStatusData) { setClaimStatus(claimStatusData) }
  }, [raffleData, claimStatusData])

  if (raffleError && raffleError.statusCode === 400) {
    return <Custom404 title={"Raffle may not exist or deleted"} />
  }

  return (
    <>
      <div className="container mx-auto max-w-[920px] min-w-[380px] px-6">
        <div className="flex justify-center mb-5">
          <div className="text-xs sm:text-base w-[400px] py-2 px-3 flex flex-col justify-center items-center bg-drizzle-green-light rounded-2xl">
            <a href="https://floats.city/0x39b144ab4d348e2b/event/420442474"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-col items-center justify-center">
                <label>🎉 <span className="font-bold">Drizzle</span> has been launched on FLOW mainnet! 🎉</label>
                <label><span className="font-bold">CLICK TO CLAIM</span> the commemorative <span className="font-bold">FLOAT</span> now!</label>
              </div>
            </a>
          </div>
        </div>
        {
          raffle ?
            <RafflePresenter
              raffle={raffle}
              claimStatus={claimStatus}
              user={user}
              host={host}
            /> :
            <div className="flex h-[200px] mt-10 justify-center">
              <SpinnerCircular size={50} thickness={180} speed={100} color="#00d588" secondaryColor="#e2e8f0" />
            </div>
        }
      </div>
    </>
  )
}