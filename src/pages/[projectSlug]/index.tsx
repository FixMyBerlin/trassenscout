import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { ProjectMap } from "@/src/core/components/Map/ProjectMap"
import { ProjectMapFallback } from "@/src/core/components/Map/ProjectMapFallback"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageDescription } from "@/src/core/components/pages/PageDescription"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoTitleSlug, shortTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useTryProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { CalenderDashboard } from "@/src/pagesComponents/calendar-entries/CalenderDashboard"
import { OperatorFilterDropdown } from "@/src/pagesComponents/projects/OperatorFilterDropdown"
import { ProjectInfoPanel } from "@/src/pagesComponents/projects/ProjectInfoPanel"
import { SubsectionTable } from "@/src/pagesComponents/subsections/SubsectionTable"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { BlitzPage, Routes, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { MapProvider } from "react-map-gl/maplibre"
import { IfUserCanEdit } from "../../pagesComponents/memberships/IfUserCan"

export const ProjectDashboardWithQuery = () => {
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
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
        <IfUserCanEdit>
          <ButtonWrapper>
            <Link button="blue" href={Routes.NewSubsectionPage({ projectSlug })}>
              Neuer Planungsabschnitt
            </Link>
            <Link button="blue" href={Routes.EditProjectPage({ projectSlug })}>
              {shortTitle(project.slug)} bearbeiten
            </Link>
          </ButtonWrapper>
        </IfUserCanEdit>
        <div className="border-t px-4 py-5 text-center text-gray-500">
          Noch keine Planungsabschnitte angelegt
        </div>
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
          <IfUserCanEdit>
            <Link icon="edit" href={Routes.EditProjectPage({ projectSlug })}>
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />
      <details>
        <summary className="mt-6 cursor-pointer">Info & Auswertung</summary>
        <ProjectInfoPanel />
      </details>

      {project.description && (
        <PageDescription>
          <Markdown markdown={project.description} />
        </PageDescription>
      )}

      <OperatorFilterDropdown />

      {Boolean(filteredSubsections.length) ? (
        <MapProvider>
          <ProjectMap subsections={filteredSubsections} />
        </MapProvider>
      ) : (
        <ProjectMapFallback subsections={subsections} />
      )}

      <SubsectionTable subsections={filteredSubsections} />

      <CalenderDashboard />
      <SuperAdminBox className="flex flex-col items-start gap-4">
        <Link button href={Routes.AdminNewSubsectionsPage({ projectSlug: project.slug })}>
          Mehrere Planungsabschnitte erstellen
        </Link>
        <Link button href={Routes.AdminSubsectionsPage({ projectSlug: project.slug })}>
          Felt Import für Planungsabschnitte
        </Link>
      </SuperAdminBox>
      <SuperAdminLogData data={{ project, subsections, filteredSubsections }} />
    </>
  )
}

const ProjectDashboardPage: BlitzPage = () => {
  const projectSlug = useTryProjectSlug()
  return (
    <Suspense fallback={<Spinner page />}>
      <LayoutRs>{projectSlug ? <ProjectDashboardWithQuery /> : <Spinner page />}</LayoutRs>
    </Suspense>
  )
}

export default ProjectDashboardPage
