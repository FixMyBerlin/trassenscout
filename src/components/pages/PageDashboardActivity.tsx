import { useQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { LogEntriesFeed } from "@/src/components/admin/log-entries/LogEntriesFeed"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderToolbarLink } from "@/src/components/core/components/PageHeader/PageHeaderToolbarLink"
import { Spinner } from "@/src/components/core/components/Spinner"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { useDashboardTabs } from "@/src/components/dashboard/useDashboardTabs"
import { canSeeProjectActivity } from "@/src/components/dashboard/useProjectPageTabs"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { mergeDashboardSearch } from "@/src/shared/dashboard/mergeDashboardSearch"
import { dashboardFilterValues } from "@/src/shared/dashboard/searchSchemas"
import { logEntriesExportHref } from "@/src/shared/logEntries/exportHref"

const routeApi = getRouteApi("/_loggedInGeneral/dashboard/activity/")

export function PageDashboardActivity() {
  const tabs = useDashboardTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/dashboard/activity/" })
  const { data: user } = useQuery(currentUserQueryOptions())
  const { data: allProjects = [] } = useQuery(projectsWithGeometryWithMembershipRoleQueryOptions())
  // A project picked on another tab stays selected, even when its log is hidden.
  const projects = allProjects.filter(
    (project) =>
      (project.showLogEntries && project.memberships[0]?.role === "EDITOR") ||
      project.slug === search.projectSlug,
  )
  const selectedProject = allProjects.find((project) => project.slug === search.projectSlug)
  const selectedRole = selectedProject?.memberships[0]?.role
  const canSeeSelected =
    !selectedProject ||
    canSeeProjectActivity({
      role: user?.role,
      membershipRole: selectedRole,
      showLogEntries: selectedProject.showLogEntries,
    })

  return (
    <>
      <PageHeader
        title="Aktivitäten"
        titleVisuallyHidden
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbStep>Meine Projekte</BreadcrumbStep>
          </Breadcrumb>
        }
        info="Alle Änderungen in den Projekten, in denen Sie mitarbeiten – neueste zuerst."
        tabs={<TabsApp tabs={tabs} embedded />}
        filtersAction={
          <PageHeaderToolbarLink
            href={logEntriesExportHref(dashboardFilterValues(search))}
            label="Alle Änderungen dieser Auswahl als .csv herunterladen"
          >
            CSV
          </PageHeaderToolbarLink>
        }
        filters={
          <DashboardFilters
            projectSlug={search.projectSlug}
            months={search.months}
            projects={projects}
            showTimeRange
            onChange={(next) =>
              void navigate({
                search: (prev) => mergeDashboardSearch(prev, next),
                ...preserveScrollNavigateOptions,
              })
            }
          />
        }
      />
      {canSeeSelected ? (
        <LogEntriesFeed
          {...dashboardFilterValues(search)}
          showProject
          fallback={<Spinner page />}
          emptyText="Kein Zugriff auf das Aktivitätenlog"
        />
      ) : (
        <div className={pageContentPaddingClassName}>
          <Notice type="info" title="Aktivitäten nicht verfügbar">
            <p>
              {selectedRole === "EDITOR"
                ? "Für dieses Projekt ist die Aktivitätenliste nicht freigeschaltet."
                : "Mit Leserechten für dieses Projekt ist die Aktivitätenliste nicht einsehbar."}
            </p>
          </Notice>
        </div>
      )}
    </>
  )
}
