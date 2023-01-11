import { BlitzPage } from "@blitzjs/next"
import { CalenderDashboard } from "src/calendar-entries/components"
import { LayoutRs8, MetaTags } from "src/core/layouts"

const Rs8Index: BlitzPage = () => {
  return (
    <LayoutRs8>
      <MetaTags title="RSV Startseite" />
      <CalenderDashboard />
    </LayoutRs8>
  )
}

Rs8Index.authenticate = true

export default Rs8Index
