"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { SubsubsectionMapWithProvider } from "@/src/core/components/Map/SubsubsectionMapWithProvider"
import { Notice } from "@/src/core/components/Notice/Notice"
import { Spinner } from "@/src/core/components/Spinner"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import {
  subsubsectionDashboardRoute,
  subsubsectionEditRoute,
  subsubsectionLandAcquisitionRoute,
} from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { SubsubsectionDetailsContent } from "./SubsubsectionDetailsContent"
import { SubsubsectionLandAcquisitionContent } from "./SubsubsectionLandAcquisitionContent"

export type SubsubsectionTabKey = "general" | "land-acquisition"

const defaultQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
}

type Props = {
  activeTab?: SubsubsectionTabKey
}

export const SubsubsectionDashboardClient = ({ activeTab = "general" }: Props) => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")

  const [subsectionsResult, { isLoading: subsectionsLoading }] = useQuery(
    getSubsections,
    { projectSlug },
    defaultQueryOptions,
  )
  const subsections = subsectionsResult?.subsections ?? []
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  const [subsubsection, { isLoading: subsubsectionLoading }] = useQuery(
    getSubsubsection,
    {
      projectSlug,
      subsectionSlug: subsectionSlug!,
      subsubsectionSlug: subsubsectionSlug!,
    },
    {
      enabled: Boolean(subsectionSlug && subsubsectionSlug),
      ...defaultQueryOptions,
    },
  )

  const [subsubsectionsResult, { isLoading: subsubsectionsLoading }] = useQuery(
    getSubsubsections,
    { projectSlug, where: { subsection: { slug: subsectionSlug } } },
    {
      enabled: Boolean(subsectionSlug),
      ...defaultQueryOptions,
    },
  )
  const subsubsections = subsubsectionsResult?.subsubsections ?? []
  const subsubsectionsHasMore = subsubsectionsResult?.hasMore
  const subsubsectionsCount = subsubsectionsResult?.count

  if ((subsectionsLoading || subsubsectionLoading || subsubsectionsLoading) && !subsubsection) {
    return <Spinner page />
  }
  if (!subsection || !subsubsection) {
    return null
  }

  const tabs = [
    {
      name: "Allgemeines",
      href: subsubsectionDashboardRoute(projectSlug, subsectionSlug!, subsubsectionSlug!),
    },
    ...(subsubsection.subsection.project.landAcquisitionModuleEnabled
      ? [
          {
            name: "Grunderwerb",
            href: subsubsectionLandAcquisitionRoute(
              projectSlug,
              subsectionSlug!,
              subsubsectionSlug!,
            ),
          },
        ]
      : []),
  ]

  return (
    <>
      <Breadcrumb />
      {subsubsectionsHasMore && (
        <Notice title="Einträge" type="warn">
          Es werden nur {subsubsections.length} von {subsubsectionsCount} Einträge auf der Karte
          angezeigt. Bitte kontaktieren Sie den Support.
        </Notice>
      )}
      <PageHeader
        titleIcon={<SubsubsectionIcon slug={subsubsection.slug} />}
        titleIconZoom={1}
        className="mt-12"
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              href={subsubsectionEditRoute(projectSlug, subsectionSlug!, subsubsectionSlug!)}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />
      {tabs.length > 1 && <TabsApp tabs={tabs} className="mt-8 max-w-md" />}

      <div className="relative flex w-full items-start gap-6">
        <div className="min-w-0 flex-1">
          <SubsubsectionMapWithProvider
            key={`map-subsubsection-${subsubsectionSlug}`}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
          />
        </div>

        <div className="max-h-[calc(100vh-10rem)] min-w-0 flex-1 self-stretch">
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

      <SuperAdminLogData
        data={{
          subsections,
          subsection,
          subsubsection,
          subsubsections,
        }}
      />
    </>
  )
}
