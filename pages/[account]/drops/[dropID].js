import { useRouter } from 'next/router'
import Head from 'next/head'

import DropPresenter from '../../../components/DropPresenter'

export default function Drop(props) {
  const router = useRouter()
  const { account, dropID} = router.query
  const user = props.user

  return (
    <>
      <Head>
        <title>drizzle | airdrop tool</title>
        <meta property="og:title" content="drizzle | airdrop tool" key="title" />
      </Head>
      <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
        <DropPresenter 
          account={account}
          dropID={dropID}
          user={user}
        />
      </div>
    </>
  )
}