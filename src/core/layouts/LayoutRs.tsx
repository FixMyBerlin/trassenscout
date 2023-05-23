import React from "react"
import { Layout } from "./Layout"
import { MetaTags } from "./MetaTags"

type Props = {
  children?: React.ReactNode
}

export const LayoutRs: React.FC<Props> = ({ children }) => {
  return (
    <Layout navigation="project" footer="project" favicon="general">
      <MetaTags noindex />
      {children}
    </Layout>
  )
}
