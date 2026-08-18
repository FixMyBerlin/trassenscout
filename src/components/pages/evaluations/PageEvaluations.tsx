import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { EvaluationChartRenderer } from "@/src/components/pages/evaluations/charts/EvaluationChartRenderer"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { evaluationsPageQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/evaluations/")

const evaluationsPagePlaceholder = {
  markdown: "Diese Seite wird in Kürze mit Auswertungen befüllt.",
} as const

export function PageEvaluations() {
  const { projectSlug } = routeApi.useParams()
  const { data: evaluationsPage } = useSuspenseQuery(evaluationsPageQueryOptions({ projectSlug }))

  const sections = evaluationsPage?.config.sections ?? []

  return (
    <>
      <PageHeader breadcrumb={<ProjectPageBreadcrumb section="Auswertungen" />} />
      {!evaluationsPage || sections.length === 0 ? (
        <Markdown
          markdown={evaluationsPagePlaceholder.markdown}
          className={pageContentPaddingClassName}
        />
      ) : (
        <div className={twJoin(pageContentPaddingClassName, "space-y-12")}>
          {sections.map((section) => (
            <section key={section.id} className="space-y-5">
              {section.markdown.trim() ? <Markdown markdown={section.markdown} /> : null}
              {section.chart ? (
                <EvaluationChartRenderer
                  chart={section.chart}
                  data={evaluationsPage.chartData[section.chart]}
                />
              ) : null}
            </section>
          ))}
        </div>
      )}
    </>
  )
}
