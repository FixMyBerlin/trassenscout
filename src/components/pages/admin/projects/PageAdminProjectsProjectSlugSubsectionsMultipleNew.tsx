import { getRouteApi } from "@tanstack/react-router"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { MultipleNewSubsectionsForm } from "@/src/components/admin/projects/[projectSlug]/subsections/multiple-new/MultipleNewSubsectionsForm"

const routeApi = getRouteApi("/admin/projects/$projectSlug/subsections/multiple-new/")

export function PageAdminProjectsProjectSlugSubsectionsMultipleNew() {
  const { projectSlug } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{
          title: `Planungsabschnitte: ${projectSlug}`,
          href: `/admin/projects/${projectSlug}/subsections`,
        }}
        title="Mehrere Planungsabschnitte erstellen"
      />
      <MultipleNewSubsectionsForm projectSlug={projectSlug} />
    </>
  )
}
