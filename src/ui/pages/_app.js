import '../styles/globals.css'
import { useState, useEffect } from "react"
import Head from 'next/head'
import { RecoilRoot } from "recoil"

import * as fcl from "@onflow/fcl"

import NavigationBar from '../components/NavigationBar'
import Footer from '../components/Footer'
import TransactionNotification from '../components/common/TransactionNotification'
import BasicNotification from '../components/common/BasicNotification'
import publicConfig from '../publicConfig'
import useSWRImmutable from 'swr'
import { domainOfAddressesFetcher } from '../lib/utils'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState({ loggedIn: null })
  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: domainData, error: domainError} = useSWRImmutable(
    user.loggedIn == true ? ["domainOfAddressesFetcher", [user.addr]] : null, domainOfAddressesFetcher
  )

  const [domains, setDomains] = useState({})

  useEffect(() => {
    if (domainData && user && user.loggedIn) {
      setDomains(domainData[user.addr])    
    }
  }, [domainData])

  return (
    <>
      <div className="bg-white text-black bg-[url('/bg.png')] bg-cover bg-center min-h-screen">
        <RecoilRoot>
          <Head>
            <title>drizzle | token distribution tool</title>
            <meta property="og:title" content="drizzle | token distribution tool" key="title" />
          </Head>
          <NavigationBar user={{...user, domains: domains, address: user.addr}} />
          <Component {...pageProps} user={{...user, domains: domains, address: user.addr}} />
          <Footer />
          <TransactionNotification />
          <BasicNotification />
        </RecoilRoot>
      </div>
    </>
  )

}

export default MyApp
