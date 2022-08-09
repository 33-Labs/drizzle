import '../styles/globals.css'
import { useState, useEffect } from "react"
import Head from 'next/head'
import { RecoilRoot } from "recoil"

import * as fcl from "@onflow/fcl"

import NavigationBar from '../components/NavigationBar'
import Footer from '../components/Footer'
import TransactionNotification from '../components/common/TransactionNotification'
import BasicNotification from '../components/common/BasicNotification'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState({ loggedIn: null })
  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  return (
    <>
      <div className="bg-white text-black bg-[url('/bg.png')] bg-cover bg-center min-h-screen">
        <RecoilRoot>
          <Head>
            <title>drizzle | token distribution tool</title>
            <meta property="og:title" content="drizzle | token distribution tool" key="title" />
          </Head>
          <NavigationBar user={user} />
          <Component {...pageProps} user={user} />
          <Footer />
          <TransactionNotification />
          <BasicNotification />
        </RecoilRoot>
      </div>
    </>
  )

}

export default MyApp
