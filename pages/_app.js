import '../styles/globals.css'
import { useState, useEffect } from "react"

import * as fcl from "@onflow/fcl"

import NavigationBar from '../components/NavigationBar'
import Footer from '../components/Footer'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState({loggedIn: null})
  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  return (
    <>
      <NavigationBar user={user} />
      <Component {...pageProps} user={user} />
      <Footer />
    </>

  )

}

export default MyApp
