import Head from 'next/head'
import Landing from '../components/Landing'

export default function Home(props) {
  return (
    <>
    <Head>
      <title>drizzle | airdrop tool</title>
      <meta property="og:title" content="drizzle | airdrop tool" key="title" />
    </Head>
    <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
      <Landing user={props.user} auth={props.auth}/>
    </div>
    </>
  )
}
