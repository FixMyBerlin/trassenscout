import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { MapProvider } from "react-map-gl"
import { CalenderDashboard } from "src/calendar-entries/components"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "src/core/components/Breadcrumb/Breadcrumb"
import { ProjectMap } from "src/core/components/Map/ProjectMap"
import { ProjectMapFallback } from "src/core/components/Map/ProjectMapFallback"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoTitleSlug, shortTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { OperatorFilterDropdown } from "src/projects/components/OperatorFilterDropdown"
import getProject from "src/projects/queries/getProject"
import { SubsectionTable } from "src/subsections/components/SubsectionTable"
import getSubsections from "src/subsections/queries/getSubsections"

export const ProjectDashboardWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ subsections }] = useQuery(
    getSubsections,
    { projectSlug: projectSlug! },
    {
      // This ensures the query does not refresh when the window regains focus https://blitzjs.com/docs/query-usage
      refetchOnWindowFocus: false,
    },
  )

  // We use the URL param `operator` to filter the UI
  // Docs: https://blitzjs.com/docs/route-params-query#use-router-query
  const params = useRouterQuery()
  const filteredSubsections = params.operator
    ? subsections.filter(
        (sec) => typeof params.operator === "string" && sec.operator?.slug === params.operator,
      )
    : subsections

  if (!subsections.length) {
    return (
      <section className="mt-12 p-5">
        <ButtonWrapper>
          <Link button="blue" href={Routes.NewSubsectionPage({ projectSlug: projectSlug! })}>
            Neuer Planungsabschnitt
          </Link>
          <Link button="blue" href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
            {shortTitle(project.slug)} bearbeiten
          </Link>
        </ButtonWrapper>
      </section>
    )
  }

  return (
    <>
      <MetaTags noindex title={seoTitleSlug(project.slug)} />

      <Breadcrumb />
      <PageHeader
        title={shortTitle(project.slug)}
        subtitle={project.subTitle}
        description={`Willkommen im Trassenscout zum ${shortTitle(
          project.slug,
        )}. Sie bekommen hier alle wichtigen Informationen zum aktuellen Stand der Planung. Unter Teilstrecken finden Sie die für Ihre Kommune wichtigen Informationen und anstehenden Aufgaben. `}
        action={
          <Link icon="edit" href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
            bearbeiten
          </Link>
        }
      />

      {project.description && (
        <PageDescription>
          <Markdown markdown={project.description} />
        </PageDescription>
      )}

      <OperatorFilterDropdown />
      <MapProvider>
        {Boolean(filteredSubsections.length) ? (
          <ProjectMap subsections={filteredSubsections} />
        ) : (
          <ProjectMapFallback subsections={subsections} />
        )}
      </MapProvider>

      <SubsectionTable subsections={filteredSubsections} />

      <CalenderDashboard />

      <SuperAdminLogData data={{ project, subsections, filteredSubsections }} />
    </>
  )
}

const ProjectDashboardPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <ProjectDashboardWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

export default ProjectDashboardPage
