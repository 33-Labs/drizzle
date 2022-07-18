import { SpinnerCircular } from 'spinners-react'

import DropCard from './drop/DropCard'
import ManageCard from './presenter/ManageCard'
import StatsCard from './presenter/StatsCard'
import AlertModal from './toolbox/AlertModal'

export default function DropPresenter(props) {
  const { drop, claimStatus, user, host } = props

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
    </>
  )
}