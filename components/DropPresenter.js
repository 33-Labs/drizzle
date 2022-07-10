import { SpinnerCircular } from 'spinners-react'

import DropCard from './DropCard'
import ManageCard from './ManageCard'
import StatsCard from './StatsCard'

import { convertCadenceDateTime } from '../lib/utils'

export default function DropPresenter(props) {
  const {drop, claimStatus, stats, user, host} = props

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
                user && (user.addr == host) ? (
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
    </>
  )
}