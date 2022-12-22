import Head from "next/head"
import React, { FC } from "react"
import { BlitzLayout } from "@blitzjs/next"

type Props = { children?: React.ReactNode }

const Layout: BlitzLayout<Props> = ({ children }) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      {children}
    </>
  )
}

export default Layout
