import {
  createFileRoute,
  Outlet,
  retainSearchParams,
  stripSearchParams,
} from "@tanstack/react-router"
import { ProjectModalHost } from "@/src/components/projectModals/ProjectModalHost"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import {
  DASHBOARD_ALL_MONTHS,
  DASHBOARD_ALL_PROJECTS,
  type DashboardLayoutSearch,
  dashboardLayoutSearchSchema,
} from "@/src/shared/dashboard/searchSchemas"
import { viewModeSearchMiddlewares } from "@/src/shared/routing/viewModeSearch"

function DashboardLayout() {
  return (
    <>
      <Outlet />
      <ProjectModalHost />
    </>
  )
}

export const Route = createFileRoute("/_loggedInGeneral/dashboard")({
  beforeLoad: () => {
    endpointAuth.inherited("auth enforced by the logged-in layout")
  },
  validateSearch: dashboardLayoutSearchSchema,
  search: {
    middlewares: [
      ...viewModeSearchMiddlewares<DashboardLayoutSearch>(),
      retainSearchParams<DashboardLayoutSearch>(["projectSlug", "months"]),
      stripSearchParams<DashboardLayoutSearch>({
        projectSlug: DASHBOARD_ALL_PROJECTS,
        months: DASHBOARD_ALL_MONTHS,
      }),
    ],
  },
  component: DashboardLayout,
})
