import React from "react"
import { Layout } from "./Layout"

type Props = {
  children?: React.ReactNode
}

export const LayoutParticipation: React.FC<Props> = ({ children }) => {
  return (
    <Layout navigation="participation" footer="participation">
      {children}
    </Layout>
  )
}
