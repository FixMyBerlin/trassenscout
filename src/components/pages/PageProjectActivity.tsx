import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { LogEntriesFeed } from "@/src/components/admin/log-entries/LogEntriesFeed"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderToolbarLink } from "@/src/components/core/components/PageHeader/PageHeaderToolbarLink"
import { Spinner } from "@/src/components/core/components/Spinner"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { useProjectPageTabs } from "@/src/components/dashboard/useProjectPageTabs"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { DASHBOARD_ALL_PROJECTS } from "@/src/shared/dashboard/searchSchemas"
import { logEntriesExportHref } from "@/src/shared/logEntries/exportHref"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/activity/")

export function PageProjectActivity() {
  const { projectSlug } = routeApi.useParams()
  const tabs = useProjectPageTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/$projectSlug/activity/" })
  const months = search.months || undefined

  return (
    <>
      <PageHeader
        title="Aktivitäten"
        titleVisuallyHidden
        breadcrumb={<ProjectPageBreadcrumb />}
        info="Alle Änderungen in diesem Projekt – neueste zuerst."
        tabs={<TabsApp tabs={tabs} embedded />}
        filtersAction={
          <PageHeaderToolbarLink
            href={logEntriesExportHref({ projectSlug, months })}
            label="Alle Änderungen dieser Auswahl als .csv herunterladen"
          >
            CSV
          </PageHeaderToolbarLink>
        }
        filters={
          <DashboardFilters
            projectSlug={DASHBOARD_ALL_PROJECTS}
            months={search.months}
            projects={[]}
            showProjectFilter={false}
            showTimeRange
            onChange={(next) =>
              void navigate({
                search: (prev) => ({ ...prev, months: next.months }),
                ...preserveScrollNavigateOptions,
              })
            }
          />
        }
      />
      <LogEntriesFeed
        projectSlug={projectSlug}
        months={months}
        fallback={<Spinner page />}
        emptyText="Kein Zugriff auf das Aktivitätenlog
Du hast in diesem Projekt Leserechte. Das Aktivitätenlog ist nur für Mitglieder mit Bearbeitungsrechten (Editor-Rolle) sichtbar."
      />
    </>
  )
}
