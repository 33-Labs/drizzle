import Head from 'next/head'
import NDropCreator from '../components/NDropCreator'

export default function NewNDrop(props) {
  return (
    <>
      <Head>
        <title>drizzle | airdrop tool</title>
        <meta property="og:title" content="drizzle | airdrop tool" key="title" />
      </Head>
      <div className="container mx-auto max-w-[680px] min-w-[380px] px-6">
        <NDropCreator user={props.user} />
      </div>
    </>
  )
}