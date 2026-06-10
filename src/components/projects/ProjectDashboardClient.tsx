import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { MapProvider } from "react-map-gl/maplibre"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { ProjectMap } from "@/src/components/core/components/Map/ProjectMap"
import { ProjectMapFallback } from "@/src/components/core/components/Map/ProjectMapFallback"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { OperatorFilter } from "./OperatorFilter"
import { SubsectionTable } from "./SubsectionTable"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/")

export const ProjectDashboardClient = () => {
  const { projectSlug } = routeApi.useParams()
  const { operator: operatorParam } = routeApi.useSearch()

  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const { data: subsections } = useSuspenseQuery(subsectionsQueryOptions({ projectSlug }))

  const filteredSubsections = operatorParam
    ? subsections.filter((sec) => sec.operator?.slug === operatorParam)
    : subsections

  return (
    <>
      <PageHeader
        title={shortTitle(project.slug)}
        subtitle={project.subTitle}
        description={project.description ? <Markdown markdown={project.description} /> : undefined}
        action={
          <IfUserCanEdit>
            <Link button="white" icon="edit" to="/$projectSlug/edit" params={{ projectSlug }}>
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />

      <OperatorFilter />
      {subsections.length ? (
        filteredSubsections.length ? (
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
        <Link button to={`/admin/projects/${projectSlug}/subsections/multiple-new`}>
          Mehrere Planungsabschnitte erstellen
        </Link>
        <Link button to={`/admin/projects/${projectSlug}/subsections`}>
          Placemark Import für Planungsabschnitte
        </Link>
      </SuperAdminBox>
      <SuperAdminLogData data={{ project, subsections, filteredSubsections }} />
    </>
  )
}
