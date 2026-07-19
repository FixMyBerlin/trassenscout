import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Outlet, useRouter } from "@tanstack/react-router"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { SubsubsectionDeleteAllAcquisitionAreasAdmin } from "@/src/components/abschnitte/SubsubsectionDeleteAllAcquisitionAreasAdmin"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"

const layoutRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard",
)

export function LayoutSubsubsection() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = layoutRouteApi.useParams()
  const router = useRouter()
  const subsubsectionParams = { projectSlug, subsectionSlug, subsubsectionSlug }

  const { data: subsection } = useSuspenseQuery(
    subsectionBySlugQueryOptions({ projectSlug, subsectionSlug }),
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
    <>
      <PageHeader
        breadcrumb={<AbschnitteBreadcrumb />}
        info="Detailansicht der Maßnahme mit allgemeinen Informationen und Grunderwerb."
        tabs={tabs.length > 1 ? <TabsApp tabs={tabs} embedded /> : undefined}
        viewSwitch
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
      />
      <Outlet />
      <SubsubsectionDeleteAllAcquisitionAreasAdmin
        projectSlug={projectSlug}
        subsectionSlug={subsectionSlug}
        subsubsectionSlug={subsubsectionSlug}
        subsubsectionId={subsubsection.id}
      />
      <SuperAdminLogData data={{ subsection, subsubsection }} />
    </>
  )
}
