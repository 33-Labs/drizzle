import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { SpinnerCircular } from 'spinners-react'
import Decimal from 'decimal.js'

import DropCard from './DropCard'
import ShareCard from './ShareCard'
import ManageCard from './ManageCard'
import StatsCard from './StatsCard'

import publicConfig from '../publicConfig'
import {
  queryDrop,
  queryClaimStatus,
  queryClaimed,
  queryStats
} from '../lib/scripts'
import { convertCadenceDateTime } from '../lib/utils'

const dropFetcher = async (funcName, dropID, host) => {
  return await queryDrop(dropID, host)
}

const claimStatusFetcher = async (funcName, dropID, host, claimer) => {
  return await queryClaimStatus(dropID, host, claimer)
}

const claimedFetcher = async (funcName, dropID, host) => {
  return await queryClaimed(dropID, host)
}

const statsFetcher = async (funcName, dropID, host) => {
  return await queryStats(dropID, host)
}

export default function DropPresenter(props) {
  const [drop, setDrop] = useState(null)
  const [claimStatus, setClaimStatus] = useState({ message: "not eligible", claimableAmount: null })
  const [stats, setStats] = useState(null)

  const account = props.account
  const dropID = props.dropID
  const user = props.user
  const { data: dropData, error: dropError } = useSWR(
    dropID && account ? ["dropFetcher", dropID, account] : null, dropFetcher)
  const { data: claimStatusData, error: claimStatusError } = useSWR(
    dropID && account && user && user.loggedIn ? ["claimStatusFetcher", dropID, account, user.addr] : null, claimStatusFetcher)

  const { data: statsData, error: statsError } = useSWR(
    dropID && account ? ["statsFetcher", dropID, account] : null, statsFetcher)

  useEffect(() => {
    if (dropData) { setDrop(dropData) }
    if (claimStatusData) { setClaimStatus(claimStatusData) }
    if (statsData) { 
      console.log(statsData)
      setStats(statsData) }
  }, [dropData, claimStatusData, statsData])

  return (
    <>
      {
        (drop && claimStatus) ? (
          <>
            <div className="flex justify-center mb-10">
              <DropCard
                isPreview={false}
                banner={drop.image}
                name={drop.name}
                url={drop.url}
                host={drop.host}
                createdAt={convertCadenceDateTime(drop.createdAt)}
                description={drop.description}
                tokenInfo={drop.tokenInfo}
                startAt={drop.startAt ? convertCadenceDateTime(drop.startAt) : null}
                endAt={drop.endAt ? convertCadenceDateTime(drop.endAt) : null}
                claimStatus={claimStatus}
                dropID={drop.dropID}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <StatsCard stats={stats} />
              {
                user && (user.addr == account) ? (
                  <>
                    <ManageCard />
                  </>
                ) : null
              }
            </div>
          </>

        ) : <div className="flex h-[200px] mt-10 justify-center">
          <SpinnerCircular size={50} thickness={180} speed={100} color="#68ee8e" secondaryColor="#e2e8f0" />
        </div>
      }
    </>
  )
}