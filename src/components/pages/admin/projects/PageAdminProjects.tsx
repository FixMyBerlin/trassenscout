import { useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { AdminAlkisLandAcquisitionDemoTools } from "@/src/components/admin/projects/AdminAlkisLandAcquisitionDemoTools"
import { AdminProjectsTable } from "@/src/components/admin/projects/AdminProjectsTable"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export function PageAdminProjects() {
  const {
    data: { projects },
  } = useSuspenseQuery(adminProjectsWithCountsQueryOptions())

  return (
    <>
      <AdminPageHeader
        title="Alle Projekte"
        action={
          <CoreLink to="/admin/projects/new" button className={adminHeaderActionButtonClassName}>
            Neues Projekt
          </CoreLink>
        }
      />
      <AdminProjectsTable projects={projects} />
      <div className="mt-8">
        <AdminAlkisLandAcquisitionDemoTools />
      </div>
    </>
  )
}
