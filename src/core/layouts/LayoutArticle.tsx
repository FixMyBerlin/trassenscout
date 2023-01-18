import { BlitzLayout } from "@blitzjs/next"
import clsx from "clsx"
import React from "react"
import { proseClasses } from "../components/text"
import { Layout } from "./Layout"

type Props = {
  children?: React.ReactNode
}

export const LayoutArticle: BlitzLayout<Props> = ({ children }) => {
  return (
    <Layout>
      <div className={clsx(proseClasses, "mx-auto w-full")}>{children}</div>
    </Layout>
  )
}
