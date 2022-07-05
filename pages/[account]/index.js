import Head from 'next/head'
import { useRouter } from 'next/router'

import { useState, useEffect } from 'react'
import drizzleService from '../../lib/drizzleService'

const convertDropNs = (dropNMaps) => {
  const dropIDs = Object.keys(dropNMaps)
  let dropNs = []
  for (let i = 0; i < dropIDs.length; i++) {
    const dropID = dropIDs[i]
    const drop = dropNMaps[dropID]
    dropNs.push(drop)
  }

  console.log(dropNs)
  return dropNs.sort((a, b) => a.uuid > b.uuid)
}

export default function Account(props) {
  const [dropNs, setDropNs] = useState([])
  const [isLoading, setLoading] = useState(false)

  const router = useRouter()
  const { account } = router.query
  console.log(account)

  useEffect(() => {
    setLoading(true)
    const getDropNs = async (address) => {
      const drops = await drizzleService.queryDropNs(address)
      setDropNs(convertDropNs(drops))
    }

    if (account) {
      getDropNs(account)
    }
  }, [account])
  
  return (
    <>
    <Head>
      <title>drizzle | airdrop tool</title>
      <meta property="og:title" content="drizzle | airdrop tool" key="title" />
    </Head>
    <div className="container mx-auto max-w-[680px] min-w-[380px] px-6">
      <div className="flex flex-col gap-y-2">
        <label className="block text-2xl font-bold font-flow">
          DropNs ({dropNs.length})
        </label>
        {
          dropNs.length > 0 ? (
            dropNs.map((drop) => {
              return (
                <div className="font-flow font-bold text-black">
                  {drop.name}
                </div>
              )
            })
          ) : null
        }
      </div>
    </div>

    </>
  )
}
