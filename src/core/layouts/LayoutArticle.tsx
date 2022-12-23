import { BlitzLayout } from "@blitzjs/next"
import React from "react"
import { Layout } from "./Layout"

type Props = {
  children?: React.ReactNode
}

export const LayoutArticle: BlitzLayout<Props> = ({ children }) => {
  return (
    <Layout>
      <div className="prose mx-auto w-full">{children}</div>
    </Layout>
  )
}
