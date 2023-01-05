import { BlitzPage } from "@blitzjs/next"
import { LayoutRs8, MetaTags } from "src/core/layouts"
import { PageKontakte } from "src/rs8/kontakte/components"

const Rs8Kontakte: BlitzPage = () => {
  return (
    <LayoutRs8>
      <MetaTags title="RSV Startseite" />
      <PageKontakte />
    </LayoutRs8>
  )
}

export default Rs8Kontakte
