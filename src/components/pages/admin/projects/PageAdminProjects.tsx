import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { startTransition, useDeferredValue } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminSearchField } from "@/src/components/admin/AdminSearchField"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { AdminAlkisLandAcquisitionDemoTools } from "@/src/components/admin/projects/AdminAlkisLandAcquisitionDemoTools"
import { AdminProjectsTable } from "@/src/components/admin/projects/AdminProjectsTable"
import { filterAdminProjects } from "@/src/components/admin/projects/filterAdminProjects"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const routeApi = getRouteApi("/admin/projects/")

export function PageAdminProjects() {
  const { project = "" } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const deferredProjectQuery = useDeferredValue(project)
  const isFiltering = project !== deferredProjectQuery

  const {
    data: { projects },
  } = useSuspenseQuery(adminProjectsWithCountsQueryOptions())

  const setProjectQuery = (value: string) => {
    startTransition(() => {
      void navigate({
        search: (previous) => ({
          ...previous,
          project: value.trim() || undefined,
        }),
        ...preserveScrollNavigateOptions,
      })
    })
  }

  const filteredProjects = filterAdminProjects(projects, deferredProjectQuery)

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
      <div className="flex flex-col gap-4">
        <form
          id="admin-projects-filter"
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <AdminSearchField
            name="project"
            value={project}
            ariaLabel="Projekte filtern"
            placeholder="Projekt-Slug"
            onChange={setProjectQuery}
          />
        </form>
        <AdminProjectsTable
          projects={filteredProjects}
          isFiltering={isFiltering}
          hasActiveFilter={deferredProjectQuery.trim().length > 0}
        />
      </div>
      <div className="mt-8">
        <AdminAlkisLandAcquisitionDemoTools />
      </div>
    </>
  )
}
