import { useRouter } from 'next/router'
import useSWR from 'swr'
import { SpinnerCircular } from 'spinners-react'

import { useState, useEffect } from 'react'
import DropList from '../../components/DropList'
import { queryDrops } from '../../lib/scripts'
import Custom404 from '../404'

const convertDrops = (dropMaps) => {
  const dropIDs = Object.keys(dropMaps)
  let drops = []
  for (let i = 0; i < dropIDs.length; i++) {
    const dropID = dropIDs[i]
    const drop = dropMaps[dropID]
    drops.push(drop)
  }

  return drops.sort((a, b) => b.dropID - a.dropID)
}

const dropsFetcher = async (address) => {
  return await queryDrops(address)
}

export default function Account(props) {
  const router = useRouter()
  const { account } = router.query

  const [drops, setDrops] = useState([])
  const {data, error} = useSWR(account, dropsFetcher)

  useEffect(() => {
    if (data) {
      setDrops(convertDrops(data))
    }
  }, [data])

  if (error && error.statusCode === 400) {
    return <Custom404 title={"Account may not exist"} />
  }
  
  return (
    <>
    <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
      {
        !data ? 
          <div className="flex mt-10 h-[200px] justify-center">
            <SpinnerCircular size={50} thickness={180} speed={100} color="#00d588" secondaryColor="#e2e8f0" />
          </div> :
          <DropList drops={drops} user={props.user} pageAccount={account} />
      }
    </div>
    </>
  )
}
