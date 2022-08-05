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
  const { account, raffleID} = router.query
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
      <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
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