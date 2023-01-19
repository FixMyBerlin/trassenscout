import { BlitzLayout } from "@blitzjs/next"
import Head from "next/head"
import { NavigationGeneral } from "./Navigation"

type Props = {
  navigation?: boolean
  children?: React.ReactNode
}

export const Layout: BlitzLayout<Props> = ({ navigation, children }) => {
  return (
    <>
      <Head>
        {/* Reminder: We cannot use this to set the <body class>. See index.css for our workaround. */}
        <link rel="icon" href="/favicon.svg" />
        {/* TODO: Remove this once we go live */}
        <meta data-process-env-node_env={process.env.NODE_ENV} />
      </Head>
      <div className="text-dark-gray relative flex h-full flex-col overflow-x-hidden">
        {navigation !== false && <NavigationGeneral />}
        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
      </div>
    </>
  )
}
