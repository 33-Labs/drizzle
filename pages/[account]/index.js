import Head from 'next/head'
import { useRouter } from 'next/router'

import { useState, useEffect } from 'react'
import DropList from '../../components/DropList'
import { queryDrops } from '../../lib/scripts'
import useSWR from 'swr'

const convertDropNs = (dropNMaps) => {
  const dropIDs = Object.keys(dropNMaps)
  let dropNs = []
  for (let i = 0; i < dropIDs.length; i++) {
    const dropID = dropIDs[i]
    const drop = dropNMaps[dropID]
    dropNs.push(drop)
  }

  return dropNs.sort((a, b) => a.uuid > b.uuid)
}

const dropsFetcher = async (address) => {
  return await queryDrops(address)
}

export default function Account(props) {
  const router = useRouter()
  const { account } = router.query

  const [dropNs, setDropNs] = useState([])
  const {data, error} = useSWR(account, dropsFetcher)

  useEffect(() => {
    if (data) {
      setDropNs(convertDropNs(data))
    }
  }, [data])
  
  return (
    <>
    <Head>
      <title>drizzle | airdrop tool</title>
      <meta property="og:title" content="drizzle | airdrop tool" key="title" />
    </Head>
    <div className="container mx-auto max-w-[680px] min-w-[380px] px-6">
      <DropList drops={dropNs} user={props.user} />
    </div>
    </>
  )
}
