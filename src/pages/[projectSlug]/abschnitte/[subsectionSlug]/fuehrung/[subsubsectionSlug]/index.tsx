import { useSlugs } from "@/src/core/hooks"
import { BlitzPage } from "@blitzjs/next"
import SubsectionDashboardPage from "../.."

const SubsubsectionDashboardPage: BlitzPage = () => {
  const { subsubsectionSlug } = useSlugs()
  if (subsubsectionSlug === undefined) return null

  return <SubsectionDashboardPage />
}

SubsubsectionDashboardPage.authenticate = true

export default SubsubsectionDashboardPage
