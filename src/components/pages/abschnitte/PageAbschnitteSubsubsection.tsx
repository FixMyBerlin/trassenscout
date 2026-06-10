import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionDashboardPage } from "./_components/SubsubsectionDashboardPage"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/",
)

export function PageAbschnitteSubsubsection() {
  const { subsection, subsubsection, subsections } = routeApi.useLoaderData()
  return (
    <SubsubsectionDashboardPage
      activeTab="general"
      subsection={subsection}
      subsubsection={subsubsection}
      subsections={subsections}
    />
  )
}
