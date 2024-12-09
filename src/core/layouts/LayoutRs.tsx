import { Layout } from "./Layout"
import { MetaTags } from "./MetaTags"

type Props = {
  children?: React.ReactNode
  fullWidth?: boolean
}

export const LayoutRs: React.FC<Props> = ({ children, fullWidth }) => {
  return (
    <Layout navigation="project" fullWidth={fullWidth} footer="project">
      <MetaTags noindex />
      {children}
    </Layout>
  )
}
