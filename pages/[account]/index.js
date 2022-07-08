import Head from 'next/head'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { SpinnerCircular } from 'spinners-react'

import { useState, useEffect } from 'react'
import DropList from '../../components/DropList'
import { queryDrops } from '../../lib/scripts'

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
  
  return (
    <>
    <Head>
      <title>drizzle | airdrop tool</title>
      <meta property="og:title" content="drizzle | airdrop tool" key="title" />
    </Head>
    <div className="container mx-auto max-w-[680px] min-w-[380px] px-6">
      {
        !data ? 
          <div className="flex mt-10 h-[200px] justify-center">
            <SpinnerCircular size={50} thickness={180} speed={100} color="#68ee8e" secondaryColor="#e2e8f0" />
          </div> :
          <DropList drops={drops} user={props.user} />
      }
    </div>
    </>
  )
}
