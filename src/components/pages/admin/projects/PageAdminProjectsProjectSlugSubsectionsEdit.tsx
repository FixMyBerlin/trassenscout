import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { SubsectionPlacemarkImport } from "@/src/components/admin/projects/[projectSlug]/subsections/SubsectionPlacemarkImport"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const routeApi = getRouteApi("/admin/projects/$projectSlug/subsections/edit/")

export function PageAdminProjectsProjectSlugSubsectionsEdit() {
  const { projectSlug } = routeApi.useParams()
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))

  return (
    <>
      <AdminPageHeader
        parent={{
          title: `Planungsabschnitte: ${projectSlug}`,
          href: `/admin/projects/${projectSlug}/subsections`,
        }}
        title="Geometrien bearbeiten"
      />
      <SubsectionPlacemarkImport project={project} projectSlug={projectSlug} />
    </>
  )
}
