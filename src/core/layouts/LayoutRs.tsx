import React from "react"
import { Layout } from "./Layout"

type Props = {
  children?: React.ReactNode
}

export const LayoutRs: React.FC<Props> = ({ children }) => {
  return (
    <Layout navigation="project" footer="project">
      {children}
    </Layout>
  )
}
