import { useRouter } from 'next/router'
import Head from 'next/head'

import DropCard from '../../../components/DropCard'
import ShareCard from '../../../components/ShareCard'
import ManageCard from '../../../components/ManageCard'
import StatsCard from '../../../components/StatsCard'

export default function Drop() {
  const router = useRouter()
  const { account, dropID} = router.query
  console.log(account)
  console.log(dropID)

  return (
    <>
      <Head>
        <title>drizzle | airdrop tool</title>
        <meta property="og:title" content="drizzle | airdrop tool" key="title" />
      </Head>
      <div className="container mx-auto max-w-[680px] min-w-[380px] flex flex-col items-center justify-center px-8">
        <DropCard />
        <ShareCard />
        <StatsCard />
        <ManageCard />
      </div>
    </>
  )
}