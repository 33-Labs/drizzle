import DropCard from './DropCard'
import ShareCard from './ShareCard'
import ManageCard from './ManageCard'
import StatsCard from './StatsCard'
import { useEffect, useState } from 'react'

import drizzleService from '../lib/drizzleService'
import utils from '../lib/utils'
import publicConfig from '../publicConfig'
import { serverRuntimeConfig } from '../next.config'

export default function DropPresenter(props) {
  const [drop, setDrop] = useState(null)
  const [claimableAmount, setClaimableAmount] = useState(null)

  const account = props.account
  const dropID = props.dropID
  const user = props.user

  const timezone = utils.getTimezone()

  useEffect(() => {
    const getDrop = async (address, dropID) => {
      const drop = await drizzleService.queryDrop(address, dropID)
      console.log("drop ", drop)
      setDrop(drop)
    }

    const getClaimableAmount = async (dropID, host, claimer) => {
      const amount = await drizzleService.queryClaimableAmount(dropID, host, claimer)
      setClaimableAmount(amount)
    }

    if (account) {
      getDrop(account, dropID)
    }

    if (account && user && user.loggedIn) {
      getClaimableAmount(dropID, account, user.addr)
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
                amount={claimableAmount}
                // Need symbol in tokenInfo
                tokenSymbol={"FLOW"}
                isPreview={false}
                banner={drop.image ?? "/drizzle.png"}
                url={drop.url}
                startAt={drop.startAt ? utils.convertCadenceDateTime(drop.startAt) : null}
                endAt={drop.endAt ? utils.convertCadenceDateTime(drop.endAt) : null}
                timeLockEnabled={drop.startAt != null || drop.endAt != null}
                timezone={timezone}
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