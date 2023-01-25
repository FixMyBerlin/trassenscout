import { BlitzPage } from "@blitzjs/auth"
import { PageHeader } from "src/core/components/PageHeader"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { PageKontakt } from "src/kontakt/components"

const Kontakt: BlitzPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Kontakt & Impressum" />
      <PageHeader manager={false} title="Impressum" />
      <PageKontakt />
    </LayoutArticle>
  )
}

export default Kontakt
