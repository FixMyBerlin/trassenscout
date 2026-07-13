import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { evaluationsPageQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/evaluations/")

const evaluationsPagePlaceholder = {
  title: "Auswertungen",
  markdown: "Diese Seite wird in Kürze mit Auswertungen befüllt.",
} as const

export function PageEvaluations() {
  const { projectSlug } = routeApi.useParams()
  const { data: evaluationsPage } = useSuspenseQuery(evaluationsPageQueryOptions({ projectSlug }))

  const title = evaluationsPage?.title ?? evaluationsPagePlaceholder.title
  const markdown = evaluationsPage?.markdown ?? evaluationsPagePlaceholder.markdown

  return (
    <>
      <PageHeader title={title} />
      <Markdown markdown={markdown} />
    </>
  )
}
