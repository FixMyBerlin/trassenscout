"use client"

import { SubsubsectionDeleteAllAcquisitionAreasAdmin } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/_components/SubsubsectionDeleteAllAcquisitionAreasAdmin"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { SubsubsectionMapWithProvider } from "@/src/core/components/Map/SubsubsectionMapWithProvider"
import { Notice } from "@/src/core/components/Notice/Notice"
import { Spinner } from "@/src/core/components/Spinner"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import {
  subsubsectionDashboardRoute,
  subsubsectionLandAcquisitionRoute,
} from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { SubsubsectionDetailsContent } from "./SubsubsectionDetailsContent"
import { SubsubsectionLandAcquisitionContent } from "./SubsubsectionLandAcquisitionContent"
import { SubsubsectionLandAcquisitionMap } from "./SubsubsectionLandAcquisitionMap"

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
  const showGeneralMap = activeTab === "general"

  const [subsection, { isLoading: subsectionLoading }] = useQuery(
    getSubsection,
    {
      projectSlug,
      subsectionSlug: subsectionSlug!,
    },
    {
      enabled: Boolean(subsectionSlug),
      ...defaultQueryOptions,
    },
  )

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

  const [subsectionsResult, { isLoading: subsectionsLoading }] = useQuery(
    getSubsections,
    { projectSlug },
    {
      enabled: showGeneralMap,
      ...defaultQueryOptions,
    },
  )
  const subsections = subsectionsResult?.subsections ?? []

  const [subsubsectionsResult, { isLoading: subsubsectionsLoading }] = useQuery(
    getSubsubsections,
    { projectSlug, where: { subsectionId: subsection?.id } },
    {
      enabled: showGeneralMap && !!subsection,
      ...defaultQueryOptions,
    },
  )
  const subsubsections = subsubsectionsResult?.subsubsections ?? []
  const subsubsectionsHasMore = subsubsectionsResult?.hasMore
  const subsubsectionsCount = subsubsectionsResult?.count

  if (
    (subsectionLoading ||
      subsubsectionLoading ||
      (showGeneralMap && (subsectionsLoading || subsubsectionsLoading))) &&
    !subsubsection
  ) {
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
      {showGeneralMap && subsubsectionsHasMore && (
        <Notice title="Einträge" type="warn">
          Es werden nur {subsubsections.length} von {subsubsectionsCount} Einträge auf der Karte
          angezeigt. Bitte kontaktieren Sie den Support.
        </Notice>
      )}
      <PageHeader
        titleIcon={<SubsubsectionIcon slug={subsubsection.slug} />}
        titleIconZoom={1}
        className="mt-12"
      />
      {tabs.length > 1 && <TabsApp tabs={tabs} className="mt-8 max-w-md" />}

      <div className="relative flex w-full items-start gap-6">
        <div className="min-w-0 flex-1">
          {showGeneralMap ? (
            <SubsubsectionMapWithProvider
              key={`map-subsubsection-${subsubsectionSlug}`}
              subsections={subsections}
              selectedSubsection={subsection}
              subsubsections={subsubsections}
            />
          ) : (
            <SubsubsectionLandAcquisitionMap subsubsection={subsubsection} activeTab={activeTab} />
          )}
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

      <SubsubsectionDeleteAllAcquisitionAreasAdmin
        projectSlug={projectSlug}
        subsectionSlug={subsectionSlug!}
        subsubsectionSlug={subsubsectionSlug!}
        subsubsectionId={subsubsection.id}
      />

      <SuperAdminLogData
        data={{
          subsection,
          subsubsection,
        }}
      />
    </>
  )
}
