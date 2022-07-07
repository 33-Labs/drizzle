import { useEffect, useState } from 'react'
import useSWR from 'swr'

import Decimal from 'decimal.js'

import DropCard from './DropCard'
import ShareCard from './ShareCard'
import ManageCard from './ManageCard'
import StatsCard from './StatsCard'

import publicConfig from '../publicConfig'
import { 
  queryDrop,
  queryClaimStatus
} from '../lib/scripts'
import { convertCadenceDateTime } from '../lib/utils'

const dropFetcher = async (dropID, host) => {
  return await queryDrop(dropID, host)
}

const claimStatusFetcher = async (dropID, host, claimer) => {
  return await queryClaimStatus(dropID, host, claimer)
}

export default function DropPresenter(props) {
  const [drop, setDrop] = useState(null)
  const [claimStatus, setClaimStatus] = useState({message: "not eligible", claimableAmount: null})

  const account = props.account
  const dropID = props.dropID
  const user = props.user
  const { data: dropData, error: dropError } = useSWR(
    dropID && account ? [dropID, account] : null, dropFetcher)
  const { data: claimStatusData, error: claimStatusError } = useSWR(
    dropID && account && user && user.loggedIn ?  [dropID, account, user.addr] : null , claimStatusFetcher) 

  useEffect(() => {
    if (dropData) { setDrop(dropData) }
    if (claimStatusData) { setClaimStatus(claimStatusData)}
  }, [dropData, claimStatusData])

  return (
    <>
      {
        drop ? (
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
            <ShareCard url={`${publicConfig.appURL}/${account}/drops/${dropID}`} />
            {
              user && (user.addr == account) ? (
                <>
                <StatsCard />
                <ManageCard />
                </>
              ) : null
            }
            </div>
          </>

        ) : null
      }
    </>
  )
}