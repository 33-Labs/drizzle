import Head from 'next/head'
import DropCreator from '../components/DropCreator'

export default function NewDrop(props) {
  return (
    <>
      <Head>
        <title>drizzle | airdrop tool</title>
        <meta property="og:title" content="drizzle | airdrop tool" key="title" />
      </Head>
      <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
        <DropCreator user={props.user} />
      </div>
    </>
  )
}