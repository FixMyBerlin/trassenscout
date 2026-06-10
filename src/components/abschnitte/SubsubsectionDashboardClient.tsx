import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useRouter } from "@tanstack/react-router"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { SubsubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsubsectionIcon"
import { SubsubsectionMapWithProvider } from "@/src/components/core/components/Map/SubsubsectionMapWithProvider"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import type { SubsectionBySlug } from "@/src/server/subsections/types"
import type { SubsectionsList } from "@/src/server/subsections/types"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import { SubsubsectionDeleteAllAcquisitionAreasAdmin } from "./SubsubsectionDeleteAllAcquisitionAreasAdmin"
import { SubsubsectionDetailsContent } from "./SubsubsectionDetailsContent"
import { SubsubsectionLandAcquisitionContent } from "./SubsubsectionLandAcquisitionContent"
import { SubsubsectionLandAcquisitionMap } from "./SubsubsectionLandAcquisitionMap"

const subsubsectionRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/",
)

export type SubsubsectionTabKey = "general" | "land-acquisition"

type Props = {
  activeTab?: SubsubsectionTabKey
  subsection: SubsectionBySlug
  subsubsection: SubsubsectionWithPosition
  subsections: SubsectionsList
}

function SubsubsectionDashboardBody({
  activeTab,
  subsection,
  subsubsection,
  subsections,
  projectSlug,
  subsectionSlug,
  subsubsectionSlug,
}: Props & {
  projectSlug: string
  subsectionSlug: string
  subsubsectionSlug: string
}) {
  const router = useRouter()
  const showGeneralMap = activeTab === "general"
  const { data: subsubsections } = useSuspenseQuery(
    subsubsectionsQueryOptions({ projectSlug, subsectionId: subsection.id }),
  )

  const subsubsectionParams = { projectSlug, subsectionSlug, subsubsectionSlug }
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
        heading={<SubsubsectionIcon slug={subsubsection.slug} />}
        action={
          <IfUserCanEdit>
            <Link
              button="white"
              icon="edit"
              to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/edit"
              params={subsubsectionParams}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        description={
          subsubsection.description ? <Markdown markdown={subsubsection.description} /> : undefined
        }
      />
      {tabs.length > 1 && <TabsApp tabs={tabs} className="mt-8 max-w-md" />}

      <div className="relative flex w-full items-start gap-6">
        <div className="min-w-0 flex-1">
          {showGeneralMap ? (
            <SubsubsectionMapWithProvider
              key={`map-subsubsection-${subsubsectionSlug}`}
              projectSlug={projectSlug}
              subsectionSlug={subsectionSlug}
              subsections={subsections}
              selectedSubsection={subsection}
              subsubsections={subsubsections}
              selectedSubsubsectionSlug={subsubsectionSlug}
            />
          ) : (
            <SubsubsectionLandAcquisitionMap
              subsubsection={subsubsection}
              activeTab={activeTab ?? "general"}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {activeTab === "land-acquisition" ? (
            <SubsubsectionLandAcquisitionContent
              subsectionId={subsection.id}
              subsubsectionId={subsubsection.id}
            />
          ) : (
            <SubsubsectionDetailsContent subsubsection={subsubsection} />
          )}
        </div>
      </div>

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

export const SubsubsectionDashboardClient = ({
  activeTab = "general",
  subsection,
  subsubsection,
  subsections,
}: Props) => {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = subsubsectionRouteApi.useParams()

  return (
    <SubsubsectionDashboardBody
      activeTab={activeTab}
      subsection={subsection}
      subsubsection={subsubsection}
      subsections={subsections}
      projectSlug={projectSlug}
      subsectionSlug={subsectionSlug}
      subsubsectionSlug={subsubsectionSlug}
    />
  )
}
