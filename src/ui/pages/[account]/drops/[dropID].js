import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { SpinnerCircular } from 'spinners-react'

import DropPresenter from '../../../components/drop/DropPresenter'

import {
  queryDrop,
  queryClaimStatus,
} from '../../../lib/cloud-scripts'
import Custom404 from '../../404'
import { queryAddressesOfDomains, queryDefaultDomainsOfAddresses } from '../../../lib/scripts'
import { isValidFlowAddress } from '../../../lib/utils'

const dropFetcher = async (funcName, dropID, host) => {
  const drop = await queryDrop(dropID, host)
  const hostDomains = await queryDefaultDomainsOfAddresses([host])
  drop.host = {address: host, domains: hostDomains[host]}
  const claimerAddresses = Object.keys(drop.claimedRecords) 
  // TODO: what if there are a lot of claimers? Only show domain name
  // what the claimerAddresses less than 100 now
  if (claimerAddresses.length < 100) {
    const domains = await queryDefaultDomainsOfAddresses(claimerAddresses)
    const claimedRecords = {}
    for (let [address, record] of Object.entries(drop.claimedRecords)) {
      let r = Object.assign({}, record)
      r.domains = domains[address]
      claimedRecords[address] = r
    }
    drop.claimedRecords = claimedRecords
  }
  return drop
}

const claimStatusFetcher = async (funcName, dropID, host, claimer) => {
  return await queryClaimStatus(dropID, host, claimer)
}

export default function Drop(props) {
  const router = useRouter()
  const { account, dropID } = router.query
  const [host, setHost] = useState(null)

  useEffect(() => {
    if (account) {
      if (isValidFlowAddress(account)) {
        setHost(account)
      } else {
        queryAddressesOfDomains([account]).then((result) => {
          if (result[account]) {
            setHost(result[account])
          } else {
            // trigger 400 page
            setHost(account)
          }
        }).catch(console.error)
      }
    }
  }, [account])

  const user = props.user

  const [drop, setDrop] = useState(null)
  const [claimStatus, setClaimStatus] = useState(null)

  const { data: dropData, error: dropError } = useSWR(
    dropID && host ? ["dropFetcher", dropID, host] : null, dropFetcher)

  const { data: claimStatusData, error: claimStatusError } = useSWR(
    dropID && host && user && user.loggedIn ? ["claimStatusFetcher", dropID, host, user.addr] : null, claimStatusFetcher)

  useEffect(() => {
    if (dropData) { setDrop(dropData) }
    if (claimStatusData) { setClaimStatus(claimStatusData) }
  }, [dropData, claimStatusData])

  if (dropError && dropError.statusCode === 400) {
    return <Custom404 title={"DROP may not exist or deleted"} />
  }

  if (claimStatusError && claimStatusError.statusCode === 400) {
    return <Custom404 title={"Raffle may not exist or deleted"} />
  }

  return (
    <>
      <div className="container mx-auto max-w-[920px] min-w-[380px] px-6">
        {
          drop ?
            <DropPresenter
              drop={drop}
              claimStatus={claimStatus}
              user={user}
              host={host}
            /> :
            <div className="flex h-[200px] mt-10 justify-center">
              <SpinnerCircular size={50} thickness={180} speed={100} color="#00d588" secondaryColor="#e2e8f0" />
            </div>
        }
      </div>
    </>
  )
}