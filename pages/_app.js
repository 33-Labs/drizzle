import '../styles/globals.css'
import { useState, useEffect } from "react"
import Head from 'next/head'

import * as fcl from "@onflow/fcl"

import NavigationBar from '../components/NavigationBar'
import Footer from '../components/Footer'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState({loggedIn: null})

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  return (
    <>
      <Head>
        <link rel="stylesheet"  href="https://cdnjs.cloudflare.com/ajax/libs/react-datepicker/2.14.1/react-datepicker.min.css" />
      </Head>
      <NavigationBar user={user} />
      <Component {...pageProps} user={user} />
      <Footer />
    </>
  )

}

export default MyApp
