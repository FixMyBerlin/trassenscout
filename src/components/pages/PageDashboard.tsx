import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import {
  MapAsideSplitLayout,
  MapListViewLayout,
  MAP_VIEWPORT_SHELL_CLASS,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
import {
  optionalPageContentPaddingClassName,
  pageContentPaddingClassName,
} from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { useViewMode } from "@/src/components/core/routes/useViewMode"
import { DASHBOARD_BOOKMARKS_LIMIT } from "@/src/components/dashboard/dashboardBookmarks"
import { DashboardBookmarksAside } from "@/src/components/dashboard/DashboardBookmarksAside"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { DashboardMapWithProvider } from "@/src/components/dashboard/DashboardMapWithProvider"
import { NoProjectMembershipsYet } from "@/src/components/dashboard/NoProjectMembershipsYet"
import { ProjectsTable } from "@/src/components/dashboard/ProjectsTable"
import { useDashboardTabs } from "@/src/components/dashboard/useDashboardTabs"
import {
  projectsForCurrentUserQueryOptions,
  projectsWithGeometryWithMembershipRoleQueryOptions,
} from "@/src/server/projects/projectsQueryOptions"
import { myBookmarkedSubsubsectionsQueryOptions } from "@/src/server/subsubsectionBookmarks/subsubsectionBookmarksQueryOptions"
import { mergeDashboardSearch } from "@/src/shared/dashboard/mergeDashboardSearch"
import { dashboardFilterValues } from "@/src/shared/dashboard/searchSchemas"

const routeApi = getRouteApi("/_loggedInGeneral/dashboard/")

export function PageDashboard() {
  const { data: allProjects } = useSuspenseQuery(
    projectsWithGeometryWithMembershipRoleQueryOptions(),
  )
  const { data: currentUserProjects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())
  const { data: bookmarkRows } = useSuspenseQuery(
    myBookmarkedSubsubsectionsQueryOptions({ limit: DASHBOARD_BOOKMARKS_LIMIT }),
  )
  const tabs = useDashboardTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/dashboard/" })
  const { viewMode, setViewMode } = useViewMode()
  const isMapMode = viewMode === "map"

  const filter = dashboardFilterValues(search)
  const projects = filter.projectSlug
    ? allProjects.filter((project) => project.slug === filter.projectSlug)
    : allProjects

  const showBookmarks = isMapMode && bookmarkRows.length > 0
  const hasMultipleBookmarkProjects =
    currentUserProjects.filter((project) => project.bookmarksEnabled).length > 1

  const header = (
    <PageHeader
      className={isMapMode ? "mb-0 shrink-0" : undefined}
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbStep>Meine Projekte</BreadcrumbStep>
        </Breadcrumb>
      }
      info="Willkommen im Trassenscout. Hier finden Sie alle Projekte, an denen Sie beteiligt sind."
      tabs={tabs.length > 1 ? <TabsApp tabs={tabs} embedded /> : undefined}
      filters={
        allProjects.length ? (
          <DashboardFilters
            projectSlug={search.projectSlug}
            months={search.months}
            projects={allProjects}
            onChange={(next) =>
              void navigate({
                search: (prev) => mergeDashboardSearch(prev, next),
                replace: true,
              })
            }
          />
        ) : undefined
      }
      viewMode={allProjects.length ? viewMode : undefined}
      onViewModeChange={allProjects.length ? setViewMode : undefined}
    />
  )

  if (!allProjects.length) {
    return (
      <>
        {header}
        <div className={pageContentPaddingClassName}>
          <NoProjectMembershipsYet />
        </div>
      </>
    )
  }

  return (
    <div className={twJoin(isMapMode && `-mb-16 ${MAP_VIEWPORT_SHELL_CLASS}`)}>
      {header}
      <MapListViewLayout
        mode={viewMode}
        map={(classHeight) => {
          const map = <DashboardMapWithProvider projects={projects} classHeight={classHeight} />
          return showBookmarks ? (
            <MapAsideSplitLayout
              asideSide="end"
              asideClassName="max-h-1/2 lg:max-h-none"
              aside={
                <DashboardBookmarksAside
                  rows={bookmarkRows}
                  showProject={hasMultipleBookmarkProjects}
                />
              }
              map={map}
            />
          ) : (
            map
          )
        }}
        list={({ interactive }) => <ProjectsTable projects={projects} interactive={interactive} />}
      >
        <div className={optionalPageContentPaddingClassName}>
          <SuperAdminLogData data={projects} />
        </div>
      </MapListViewLayout>
    </div>
  )
}
