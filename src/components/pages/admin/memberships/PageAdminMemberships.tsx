import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { startTransition, useDeferredValue } from "react"
import { twMerge } from "tailwind-merge"
import { adminTableWrapperClassName } from "@/src/components/admin/adminListClasses"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { filterMembershipsTable } from "@/src/components/admin/memberships/filterMembershipsTable"
import { MembershipsSearchBar } from "@/src/components/admin/memberships/MembershipsSearchBar"
import { MembershipsTable } from "@/src/components/admin/memberships/MembershipsTable"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { usersWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"
import type { MembershipsSearch } from "@/src/shared/memberships/searchSchemas"

const routeApi = getRouteApi("/admin/memberships/")

type SearchField = keyof Pick<MembershipsSearch, "user" | "project">

export function PageAdminMemberships() {
  const { user = "", project = "" } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const deferredUserQuery = useDeferredValue(user)
  const deferredProjectQuery = useDeferredValue(project)
  const isFiltering = user !== deferredUserQuery || project !== deferredProjectQuery

  const { data: users } = useSuspenseQuery(usersWithMembershipsQueryOptions())
  const { data: projectsResult } = useSuspenseQuery(projectsAdminQueryOptions())

  const setSearchField = (field: SearchField, value: string) => {
    startTransition(() => {
      void navigate({
        search: (previous) => ({
          ...previous,
          [field]: value.trim() || undefined,
        }),
        ...preserveScrollNavigateOptions,
      })
    })
  }

  const { users: filteredUsers, projects: filteredProjects } = filterMembershipsTable({
    users,
    projects: projectsResult.projects,
    userQuery: deferredUserQuery,
    projectQuery: deferredProjectQuery,
  })

  const hasActiveUserFilter = deferredUserQuery.trim().length > 0

  return (
    <>
      <AdminPageHeader title="Nutzer & Rechte" />
      <div className={pageContentPaddingClassName}>
        <MembershipsSearchBar
          userValue={user}
          projectValue={project}
          onUserChange={(value) => setSearchField("user", value)}
          onProjectChange={(value) => setSearchField("project", value)}
        />
      </div>
      <div
        className={twMerge(
          adminTableWrapperClassName,
          "max-h-[calc(100vh-13rem)] overflow-y-auto transition-opacity duration-150",
          isFiltering ? "opacity-60" : "",
        )}
      >
        {filteredUsers.length > 0 ? (
          <MembershipsTable users={filteredUsers} projects={filteredProjects} />
        ) : (
          <p className="px-4 py-6 text-sm text-gray-600">
            {hasActiveUserFilter
              ? "Keine Nutzer für diese Suche gefunden."
              : "Noch keine Nutzer vorhanden."}
          </p>
        )}
      </div>
    </>
  )
}
