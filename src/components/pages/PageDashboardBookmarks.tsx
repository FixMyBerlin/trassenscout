import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { SubsubsectionTable } from "@/src/components/abschnitte/SubsubsectionTable"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { BookmarksInfo } from "@/src/components/dashboard/BookmarksInfo"
import { bookmarksProjectSlug } from "@/src/components/dashboard/dashboardBookmarks"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { myBookmarkedSubsubsectionsQueryOptions } from "@/src/server/subsubsectionBookmarks/subsubsectionBookmarksQueryOptions"
import { mergeDashboardSearch } from "@/src/shared/dashboard/mergeDashboardSearch"
import { DASHBOARD_ALL_MONTHS, DASHBOARD_ALL_PROJECTS } from "@/src/shared/dashboard/searchSchemas"

const routeApi = getRouteApi("/_loggedInGeneral/dashboard/bookmarks/")

export function PageDashboardBookmarks() {
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/dashboard/bookmarks/" })
  const { data: allProjects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())

  const bookmarkProjects = allProjects.filter((project) => project.bookmarksEnabled)
  const hasMultipleProjects = bookmarkProjects.length > 1
  const selectedProjectSlug = bookmarksProjectSlug(allProjects, search.projectSlug)

  const { data: rows } = useSuspenseQuery(
    myBookmarkedSubsubsectionsQueryOptions({ projectSlug: selectedProjectSlug }),
  )

  return (
    <>
      <PageHeader
        title="Meine Maßnahmen"
        titleVisuallyHidden
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbStep to="/dashboard">Meine Projekte</BreadcrumbStep>
            <BreadcrumbStep>Meine Maßnahmen</BreadcrumbStep>
          </Breadcrumb>
        }
        info={<BookmarksInfo />}
        filters={
          hasMultipleProjects ? (
            <DashboardFilters
              projectSlug={selectedProjectSlug ?? DASHBOARD_ALL_PROJECTS}
              months={DASHBOARD_ALL_MONTHS}
              projects={bookmarkProjects}
              onChange={({ projectSlug }) =>
                void navigate({
                  search: (prev) => mergeDashboardSearch(prev, { projectSlug }),
                  ...preserveScrollNavigateOptions,
                })
              }
            />
          ) : undefined
        }
      />
      {rows.length ? (
        <SubsubsectionTable rows={rows} showProject={hasMultipleProjects} />
      ) : (
        <ZeroCase
          visible
          text={
            selectedProjectSlug
              ? "In diesem Projekt haben Sie noch keine Maßnahmen mit einem Lesezeichen versehen."
              : "Sie haben noch keine Maßnahmen mit einem Lesezeichen versehen."
          }
        />
      )}
    </>
  )
}
