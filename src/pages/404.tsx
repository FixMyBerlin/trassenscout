import { ErrorComponent } from "@blitzjs/next"
import { LayoutArticle, MetaTags } from "src/core/layouts"

export default function NotFound() {
  const statusCode = 404
  const title = "Seite nicht gefunden"
  return (
    <LayoutArticle>
      <MetaTags title="Seite nicht gefunden (404)" />
      <ErrorComponent statusCode={statusCode} title={title} />
    </LayoutArticle>
  )
}
