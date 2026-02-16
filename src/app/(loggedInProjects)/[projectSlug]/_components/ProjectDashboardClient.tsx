"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { Link } from "@/src/core/components/links"
import { ProjectMap } from "@/src/core/components/Map/ProjectMap"
import { ProjectMapFallback } from "@/src/core/components/Map/ProjectMapFallback"
import { getStaticOverlayForProject } from "@/src/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { shortTitle } from "@/src/core/components/text"
import { projectEditRoute } from "@/src/core/routes/projectRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useQuery } from "@blitzjs/rpc"
import { useSearchParams } from "next/navigation"
import { MapProvider } from "react-map-gl/maplibre"
import { OperatorFilter } from "./OperatorFilter"
import { SubsectionTable } from "./SubsectionTable"

type Props = {
  initialProject: Awaited<ReturnType<typeof getProject>>
  initialSubsections: Awaited<ReturnType<typeof getSubsections>>
}

export const ProjectDashboardClient = ({ initialProject, initialSubsections }: Props) => {
  const projectSlug = useProjectSlug()
  const searchParams = useSearchParams()
  const operatorParam = searchParams?.get("operator")

  const [project] = useQuery(
    getProject,
    { projectSlug },
    {
      initialData: initialProject,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const [subsectionsResult] = useQuery(
    getSubsections,
    { projectSlug },
    {
      initialData: initialSubsections,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsections = subsectionsResult?.subsections ?? []

  const filteredSubsections = operatorParam
    ? subsections.filter((sec) => sec.operator?.slug === operatorParam)
    : subsections

  return (
    <>
      <Breadcrumb />
      <PageHeader
        title={shortTitle(project.slug)}
        subtitle={project.subTitle}
        description={<div className="mt-4">{project.description}</div>}
        action={
          <IfUserCanEdit>
            <Link icon="edit" href={projectEditRoute(projectSlug)}>
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />

      <OperatorFilter />
      {Boolean(subsections.length) ? (
        Boolean(filteredSubsections.length) ? (
          <MapProvider>
            <ProjectMap
              subsections={filteredSubsections}
              staticOverlay={getStaticOverlayForProject(projectSlug)}
            />
          </MapProvider>
        ) : (
          <ProjectMapFallback
            subsections={subsections}
            staticOverlay={getStaticOverlayForProject(projectSlug)}
          />
        )
      ) : (
        <MapProvider>
          <ProjectMapFallback
            subsections={[]}
            staticOverlay={getStaticOverlayForProject(projectSlug)}
          />
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
