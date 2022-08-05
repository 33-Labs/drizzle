import { useState } from 'react'
import { SpinnerCircular } from 'spinners-react'
import ClaimedModal from '../common/ClaimedModal'

import DropCard from './DropCard'
import ManageCard from './ManageCard'
import StatsCard from './StatsCard'
import AlertModal from '../common/AlertModal'

export default function DropPresenter(props) {
  const { drop, claimStatus, user, host } = props
  const [showClaimedModal, setShowClaimedModal] = useState(false)
  const [claimedAmountInfo, setClaimedAmountInfo] = useState('')

  return (
    <>
      {
        (drop) ? (
          <>
            <div className="flex justify-center mb-10">
              <DropCard
                isPreview={false}
                drop={drop}
                // startAt={drop.startAt ? convertCadenceDateTime(drop.startAt) : null}
                claimStatus={claimStatus}
                user={user}
                setShowClaimedModal={setShowClaimedModal}
                setClaimedAmountInfo={setClaimedAmountInfo}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <StatsCard drop={drop} />
              {
                user && user.loggedIn && claimStatus && (user.addr == host) ? (
                  <ManageCard
                    drop={drop}
                    manager={host}
                    claimStatus={claimStatus}
                  />
                ) : null
              }
            </div>
          </>

        ) : <div className="flex h-[200px] mt-10 justify-center">
          <SpinnerCircular size={50} thickness={180} speed={100} color="#00d588" secondaryColor="#e2e8f0" />
        </div>
      }
      <AlertModal />
      <ClaimedModal open={showClaimedModal} setOpen={setShowClaimedModal} rewardInfo={claimedAmountInfo} title="Claimed Successfully!" />
    </>
  )
}