import { useState } from 'react'
import { SpinnerCircular } from 'spinners-react'
import ClaimedModal from './creator/ClaimedModal'

import RaffleCard from './raffle/RaffleCard'
import ManageCard from './presenter/ManageCard'
import StatsCard from './presenter/StatsCard'
import AlertModal from './toolbox/AlertModal'

export default function RafflePresenter(props) {
  const { raffle, claimStatus, user, host } = props
  const [showClaimedModal, setShowClaimedModal] = useState(false)
  // const [claimedAmountInfo, setClaimedAmountInfo] = useState('')

  return (
    <>
      {
        (raffle) ? (
          <>
            <div className="flex justify-center mb-10">
              <RaffleCard
                isPreview={false}
                raffle={raffle}
                // startAt={raffle.startAt ? convertCadenceDateTime(raffle.startAt) : null}
                claimStatus={claimStatus}
                user={user}
                setShowClaimedModal={setShowClaimedModal}
                // setClaimedAmountInfo={setClaimedAmountInfo}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              StatsCard
              {/* <StatsCard raffle={raffle} />
              {
                user && user.loggedIn && claimStatus && (user.addr == host) ? (
                  <ManageCard
                    raffle={raffle}
                    manager={host}
                    claimStatus={claimStatus}
                  />
                ) : null
              } */}
            </div>
          </>

        ) : <div className="flex h-[200px] mt-10 justify-center">
          <SpinnerCircular size={50} thickness={180} speed={100} color="#00d588" secondaryColor="#e2e8f0" />
        </div>
      }
      <AlertModal />
      {/* <ClaimedModal open={showClaimedModal} setOpen={setShowClaimedModal} claimedAmountInfo={claimedAmountInfo} /> */}
    </>
  )
}