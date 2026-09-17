import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { GeneralLogEntries } from "@/src/components/admin/log-entries/GeneralLogEntries"
import { LogEntriesTable } from "@/src/components/admin/log-entries/LogEntriesTable"
import { SpinnerIcon } from "@/src/components/core/components/Spinner"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { logEntriesQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { DASHBOARD_ALL_MONTHS, DASHBOARD_ALL_PROJECTS } from "@/src/shared/dashboard/searchSchemas"

const routeApi = getRouteApi("/admin/log-entries/")

function LoadingHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 px-4 text-sm text-gray-500">
      <SpinnerIcon size="5" />
      {children}
    </p>
  )
}

export function PageAdminLogEntries() {
  return (
    <>
      <AdminPageHeader title="Log-Einträge" />
      <div className="space-y-8">
        <Suspense fallback={<LoadingHint>Allgemeine Änderungen werden geladen…</LoadingHint>}>
          <GeneralLogEntries hideWhenEmpty={false} />
        </Suspense>
        <ProjectLogEntriesSection />
      </div>
    </>
  )
}

function ProjectLogEntriesSection() {
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/admin/log-entries/" })
  // Admins get every project from this query.
  const { data: projects = [] } = useQuery(projectsForCurrentUserQueryOptions())

  return (
    <section className="space-y-3">
      <div className="px-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Änderungen in Projekten</h2>
        <DashboardFilters
          projectSlug={search.projectSlug ?? DASHBOARD_ALL_PROJECTS}
          months={search.months ?? DASHBOARD_ALL_MONTHS}
          projects={projects}
          showTimeRange
          onChange={(next) =>
            void navigate({
              // This route's search is only the filter, so "everything" means no param.
              search: () => ({
                projectSlug: next.projectSlug || undefined,
                months: next.months || undefined,
              }),
              ...preserveScrollNavigateOptions,
            })
          }
        />
      </div>
      <ProjectLogEntriesTable projectSlug={search.projectSlug} months={search.months} />
    </section>
  )
}

function ProjectLogEntriesTable({
  projectSlug,
  months,
}: {
  projectSlug?: string
  months?: number
}) {
  const { data, isPlaceholderData } = useQuery({
    ...logEntriesQueryOptions({ projectSlug, months }),
    placeholderData: keepPreviousData,
  })

  if (!data) return <LoadingHint>Projekt-Änderungen werden geladen…</LoadingHint>

  return (
    <div className={isPlaceholderData ? "opacity-50 transition-opacity" : undefined}>
      <LogEntriesTable
        entries={data.logEntries}
        isAdmin={data.isAdmin}
        showProject
        withTopBorder
        emptyText="Keine Einträge für diese Auswahl."
      />
    </div>
  )
}
