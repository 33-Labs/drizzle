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
      <div className="container mx-auto max-w-[680px] min-w-[380px] flex flex-col items-center justify-center px-6">
        <DropCard 
          name="Hello Drizzle!"
          host="0x0001"
          createdAt="2022-06-22"
          description="how many roads must a man walk down, before you call him a man?"
          amount="100"
          tokenSymbol="FLOW"
          isPreview={false}
        />

        <ShareCard />
        <StatsCard />
        <ManageCard />
      </div>
    </>
  )
}