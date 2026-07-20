import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Outlet, useMatchRoute, useRouter } from "@tanstack/react-router"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { Link } from "@/src/components/core/components/links/Link"
import { MAP_VIEWPORT_SHELL_CLASS } from "@/src/components/core/components/pages/MapListViewLayout"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { LandAcquisitionPrimaryAction } from "@/src/components/pages/abschnitte/PageAbschnitteLandAcquisition"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"

const layoutRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard",
)

export function LayoutSubsubsection() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = layoutRouteApi.useParams()
  const router = useRouter()
  const matchRoute = useMatchRoute()
  const subsubsectionParams = { projectSlug, subsectionSlug, subsubsectionSlug }
  const isLandAcquisition = Boolean(
    matchRoute({
      to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition",
      params: subsubsectionParams,
    }),
  )

  const { data: subsubsection } = useSuspenseQuery(
    subsubsectionBySlugQueryOptions({ projectSlug, subsectionSlug, subsubsectionSlug }),
  )

  const tabs = [
    {
      name: "Allgemeines",
      to: router.buildLocation({
        to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug",
        params: subsubsectionParams,
      }).href,
    },
    ...(subsubsection.subsection.project.landAcquisitionModuleEnabled
      ? [
          {
            name: "Grunderwerb",
            to: router.buildLocation({
              to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition",
              params: subsubsectionParams,
            }).href,
          },
        ]
      : []),
  ]

  return (
    <div className={MAP_VIEWPORT_SHELL_CLASS}>
      <PageHeader
        className="mb-0 shrink-0"
        breadcrumb={<AbschnitteBreadcrumb />}
        info="Detailansicht der Maßnahme mit allgemeinen Informationen und Grunderwerb."
        tabs={tabs.length > 1 ? <TabsApp tabs={tabs} embedded /> : undefined}
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/edit"
              params={subsubsectionParams}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        primaryAction={isLandAcquisition ? <LandAcquisitionPrimaryAction /> : undefined}
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
