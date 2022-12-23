import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import React from "react"

type Props = { children?: React.ReactNode }

export const Layout: BlitzLayout<Props> = ({ children }) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      {children}
    </>
  )
}
