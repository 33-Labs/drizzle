import { useRouter } from 'next/router'
import Head from 'next/head'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { SpinnerCircular } from 'spinners-react'

import DropPresenter from '../../../components/DropPresenter'

import { 
  queryDrop,
  queryClaimStatus,
  queryStats 
} from '../../../lib/scripts'
import Custom404 from '../../404'

const dropFetcher = async (funcName, dropID, host) => {
  return await queryDrop(dropID, host)
}

const claimStatusFetcher = async (funcName, dropID, host, claimer) => {
  console.log(`status  ${funcName} ${dropID} ${host} ${claimer}`)
  return await queryClaimStatus(dropID, host, claimer)
}

const statsFetcher = async (funcName, dropID, host) => {
  return await queryStats(dropID, host)
}

export default function Drop(props) {
  const router = useRouter()
  const { account, dropID } = router.query
  const host = account
  const user = props.user

  const [drop, setDrop] = useState(null)
  const [claimStatus, setClaimStatus] = useState({ message: "not eligible", claimableAmount: null })
  const [stats, setStats] = useState(null)

  const { data: dropData, error: dropError } = useSWR(
    dropID && host ? ["dropFetcher", dropID, host] : null, dropFetcher)

  const { data: claimStatusData, error: claimStatusError } = useSWR(
    dropID && host && user && user.loggedIn ? ["claimStatusFetcher", dropID, host, user.addr] : null, claimStatusFetcher)

  const { data: statsData, error: statsError } = useSWR(
    dropID && host ? ["statsFetcher", dropID, host] : null, statsFetcher)

  useEffect(() => {
    if (dropData) { setDrop(dropData) }
    if (claimStatusData) { setClaimStatus(claimStatusData) }
    if (statsData) { setStats(statsData) }
  }, [dropData, claimStatusData, statsData])

  if ((dropError && dropError.statusCode === 400) &&
    (claimStatusError && claimStatusError.statusCode === 400) &&
    (statsError && statsError.statusCode === 400)
  ) {
    return <Custom404 title={"DROP may not exist or deleted"} />
  }

  return (
    <>
      <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
      {
        (drop && claimStatus) ?
        <DropPresenter 
          drop={drop}
          claimStatus={claimStatus}
          stats={stats}
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