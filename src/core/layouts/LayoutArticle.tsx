import { BlitzLayout } from "@blitzjs/next"
import clsx from "clsx"
import { proseClasses } from "../components/text"
import { Layout } from "./Layout"

type Props = {
  children?: React.ReactNode
}

export const LayoutArticle: BlitzLayout<Props> = ({ children }) => {
  return (
    <Layout navigation="general" footer="general">
      <div className={clsx(proseClasses, "mx-auto w-full")}>{children}</div>
    </Layout>
  )
}
