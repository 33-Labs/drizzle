import '../styles/globals.css'
import { useState, useEffect } from "react"
import Head from 'next/head'
import { RecoilRoot } from "recoil"

import * as fcl from "@onflow/fcl"

import NavigationBar from '../components/NavigationBar'
import Footer from '../components/Footer'
import TransactionNotification from '../components/TransactionNotification'
import BasicNotification from '../components/BasicNotification'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState({loggedIn: null})

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  return (
    <>
      <RecoilRoot>
        <NavigationBar user={user} />
        <Component {...pageProps} user={user} />
        <Footer />
        <TransactionNotification />
        <BasicNotification />
      </RecoilRoot>
    </>
  )

}

export default MyApp
