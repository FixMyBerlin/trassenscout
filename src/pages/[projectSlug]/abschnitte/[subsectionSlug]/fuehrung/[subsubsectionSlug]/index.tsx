import { BlitzPage } from "@blitzjs/next"
import SubsectionDashboardPage from "../.."
import { useSlugs } from "src/core/hooks"

const SubsubsectionDashboardPage: BlitzPage = () => {
  const { subsubsectionSlug } = useSlugs()
  if (subsubsectionSlug === undefined) return null

  return <SubsectionDashboardPage />
}

SubsubsectionDashboardPage.authenticate = true

export default SubsubsectionDashboardPage
