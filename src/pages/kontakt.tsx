import { BlitzPage } from "@blitzjs/auth"
import { PageHeader } from "src/core/components/PageHeader"
import { LayoutRs8, MetaTags } from "src/core/layouts"
import { PageKontakt } from "src/kontakt/components"

const Kontakt: BlitzPage = () => {
  return (
    <LayoutRs8>
      <MetaTags noindex title="Kontakt & Impressum" />
      <PageHeader title="Impressum" />
      <PageKontakt />
    </LayoutRs8>
  )
}

export default Kontakt
