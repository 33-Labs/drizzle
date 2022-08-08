import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { SpinnerCircular } from 'spinners-react'

import DropPresenter from '../../../components/drop/DropPresenter'

import {
  queryDrop,
  queryClaimStatus,
} from '../../../lib/cloud-scripts'
import Custom404 from '../../404'

const dropFetcher = async (funcName, dropID, host) => {
  return await queryDrop(dropID, host)
}

const claimStatusFetcher = async (funcName, dropID, host, claimer) => {
  return await queryClaimStatus(dropID, host, claimer)
}

export default function Drop(props) {
  const router = useRouter()
  const { account, dropID } = router.query
  const host = account
  const user = props.user

  const [drop, setDrop] = useState(null)
  const [claimStatus, setClaimStatus] = useState(null)

  const { data: dropData, error: dropError } = useSWR(
    dropID && host ? ["dropFetcher", dropID, host] : null, dropFetcher)

  const { data: claimStatusData, error: claimStatusError } = useSWR(
    dropID && host && user && user.loggedIn ? ["claimStatusFetcher", dropID, host, user.addr] : null, claimStatusFetcher)

  useEffect(() => {
    if (dropData) { setDrop(dropData) }
    if (claimStatusData) { setClaimStatus(claimStatusData) }
  }, [dropData, claimStatusData])

  if (dropError && dropError.statusCode === 400) {
    return <Custom404 title={"DROP may not exist or deleted"} />
  }

  if (claimStatusError && claimStatusError.statusCode === 400) {
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
          drop ?
            <DropPresenter
              drop={drop}
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