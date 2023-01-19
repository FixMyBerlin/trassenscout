import { BlitzPage } from "@blitzjs/next"
import { CalenderDashboard } from "src/calendar-entries/components"
import { LayoutRs, MetaTags } from "src/core/layouts"

const Rs8Index: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags title="RSV Startseite" />
      <CalenderDashboard />
    </LayoutRs>
  )
}

Rs8Index.authenticate = true

export default Rs8Index
