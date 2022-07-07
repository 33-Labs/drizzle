import { useEffect, useState } from 'react'

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

export default function DropPresenter(props) {
  const [drop, setDrop] = useState(null)
  const [claimStatus, setClaimStatus] = useState({message: "not eligible", claimableAmount: null})

  const account = props.account
  const dropID = props.dropID
  const user = props.user

  useEffect(() => {
    const getDrop = async (address, dropID) => {
      const drop = await queryDrop(address, dropID)
      setDrop(drop)
    }

    const getClaimStatus = async (dropID, host, claimer) => {
      const status = await queryClaimStatus(dropID, host, claimer)
      setClaimStatus(status)
    }

    if (account) {
      getDrop(account, dropID)
    }

    if (account && user && user.loggedIn) {
      getClaimStatus(dropID, account, user.addr)
    }
  }, [account, dropID, user])

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