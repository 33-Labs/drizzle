import { useState } from 'react'
import { SpinnerCircular } from 'spinners-react'
import ClaimedModal from '../common/ClaimedModal'

import RaffleCard from './RaffleCard'
import AlertModal from '../common/AlertModal'
import RewardCard from './RewardCard'
import RaffleStatsCard from './RaffleStatsCard'
import WinnersCard from './WinnersCard'
import RaffleManageCard from './RaffleManageCard'

export default function RafflePresenter(props) {
  const { raffle, claimStatus, user, host } = props
  const [showClaimedModal, setShowClaimedModal] = useState(false)
  const [showRegisteredModal, setShowRegisteredModal] = useState(false)
  const [rewardInfo, setRewardInfo] = useState('')

  return (
    <>
      {
        (raffle) ? (
          <>
            <div className="flex justify-center mb-10">
              <RaffleCard
                isPreview={false}
                raffle={raffle}
                claimStatus={claimStatus}
                user={user}
                setShowClaimedModal={setShowClaimedModal}
                setShowRegisteredModal={setShowRegisteredModal}
                setRewardInfo={setRewardInfo}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <RaffleStatsCard isPreview={false} raffle={raffle} />
              <RewardCard raffle={raffle} />
              <WinnersCard isPreview={false} raffle={raffle} />
              {
                user && user.loggedIn && claimStatus && (user.addr == host) ? (
                  <RaffleManageCard
                    raffle={raffle}
                    manager={user}
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
      <ClaimedModal open={showClaimedModal} setOpen={setShowClaimedModal} rewardInfo={rewardInfo} title="Claimed Successfully!" />
      <ClaimedModal open={showRegisteredModal} setOpen={setShowRegisteredModal} title="Registered Successfully!" />
    </>
  )
}