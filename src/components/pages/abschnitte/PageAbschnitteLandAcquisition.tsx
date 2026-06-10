import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionDashboardPage } from "./_components/SubsubsectionDashboardPage"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/",
)

export function PageAbschnitteLandAcquisition() {
  const { subsection, subsubsection, subsections } = routeApi.useLoaderData()
  return (
    <SubsubsectionDashboardPage
      activeTab="land-acquisition"
      subsection={subsection}
      subsubsection={subsubsection}
      subsections={subsections}
    />
  )
}
