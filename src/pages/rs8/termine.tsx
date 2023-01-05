import { BlitzPage } from "@blitzjs/next"
import { LayoutRs8, MetaTags } from "src/core/layouts"
import { PageCalender } from "src/rs8/termine/components/PageCalender"

const Rs8Termine: BlitzPage = () => {
  return (
    <LayoutRs8>
      <MetaTags title="RSV Startseite" />
      <PageCalender />
    </LayoutRs8>
  )
}

export default Rs8Termine
