import Image from 'next/image'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
// import { useState, useEffect } from "react"
// import * as fcl from "@onflow/fcl";

import NavigationBar from '../components/NavigationBar'
import Landing from '../components/Landing'
// import TokenSelector from '../components/TokenSelector'
// import RecipientsInput from '../components/RecipientsInput'
// import WalletConnector from '../components/WalletConnector';

export default function Home(props) {
  return (
    <>
    <Head>
      <title>drizzle | airdrop tool</title>
      <meta property="og:title" content="drizzle | airdrop tool" key="title" />
    </Head>
    <div className="container mx-auto max-w-[680px] min-w-[380px] px-6">
      <Landing user={props.user} auth={props.auth}/>
    </div>
    </>
  )
}
