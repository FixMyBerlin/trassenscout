import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { ProjectMap } from "@/src/core/components/Map/ProjectMap"
import { ProjectMapFallback } from "@/src/core/components/Map/ProjectMapFallback"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoTitleSlug, shortTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useTryProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { OperatorFilterDropdown } from "@/src/pagesComponents/projects/OperatorFilterDropdown"
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

  return (
    <>
      <MetaTags noindex title={seoTitleSlug(project.slug)} />

      <Breadcrumb />
      <PageHeader
        title={shortTitle(project.slug)}
        subtitle={project.subTitle}
        description={<div className="mt-4">{project.description}</div>}
        action={
          <IfUserCanEdit>
            <Link icon="edit" href={Routes.EditProjectPage({ projectSlug })}>
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />

      <OperatorFilterDropdown />
      {Boolean(subsections.length) ? (
        Boolean(filteredSubsections.length) ? (
          <MapProvider>
            <ProjectMap subsections={filteredSubsections} />
          </MapProvider>
        ) : (
          <ProjectMapFallback subsections={subsections} />
        )
      ) : (
        <MapProvider>
          <ProjectMapFallback subsections={[]} />
        </MapProvider>
      )}

      <SubsectionTable subsections={filteredSubsections} />

      <SuperAdminBox className="flex flex-col items-start gap-4">
        <Link button href={`/admin/projects/${projectSlug}/subsections/multiple-new`}>
          Mehrere Planungsabschnitte erstellen
        </Link>
        <Link button href={`/admin/projects/${projectSlug}/subsections`}>
          Placemark Import für Planungsabschnitte
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
