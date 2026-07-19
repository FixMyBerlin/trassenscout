import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { evaluationsPageQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/evaluations/")

const evaluationsPagePlaceholder = {
  markdown: "Diese Seite wird in Kürze mit Auswertungen befüllt.",
} as const

export function PageEvaluations() {
  const { projectSlug } = routeApi.useParams()
  const { data: evaluationsPage } = useSuspenseQuery(evaluationsPageQueryOptions({ projectSlug }))

  const markdown = evaluationsPage?.markdown ?? evaluationsPagePlaceholder.markdown

  return (
    <>
      <PageHeader breadcrumb={<ProjectPageBreadcrumb section="Auswertungen" />} />
      <Markdown markdown={markdown} />
    </>
  )
}
