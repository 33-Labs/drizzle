import DropCard from './DropCard'
import ShareCard from './ShareCard'
import ManageCard from './ManageCard'
import StatsCard from './StatsCard'
import { useEffect, useState } from 'react'

import { 
  queryDrop,
  queryClaimStatus
} from '../lib/scripts'
import utils from '../lib/utils'
import publicConfig from '../publicConfig'

export default function DropPresenter(props) {
  const [drop, setDrop] = useState(null)
  const [claimStatus, setClaimStatus] = useState({message: "not eligible", claimableAmount: null})

  const account = props.account
  const dropID = props.dropID
  const user = props.user

  const timezone = utils.getTimezone()

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
                name={drop.name}
                host={drop.host}
                createdAt={utils.convertCadenceDateTime(drop.createdAt)}
                description={drop.description}
                amount={claimStatus.claimableAmount}
                // Need symbol in tokenInfo
                tokenSymbol={drop.tokenInfo.symbol}
                isPreview={false}
                banner={drop.image ?? "/drizzle.png"}
                url={drop.url}
                startAt={drop.startAt ? utils.convertCadenceDateTime(drop.startAt) : null}
                endAt={drop.endAt ? utils.convertCadenceDateTime(drop.endAt) : null}
                timeLockEnabled={drop.startAt != null || drop.endAt != null}
                timezone={timezone}
                status={claimStatus}
                dropID={drop.dropID}
                token={drop.tokenInfo}
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