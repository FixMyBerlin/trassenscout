import { PageKontakt } from "src/kontakt/components"
import { LayoutArticle, MetaTags } from "src/core/layouts"

export default function Kontakt() {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Kontakt & Impressum" />

      <PageKontakt />
    </LayoutArticle>
  )
}
