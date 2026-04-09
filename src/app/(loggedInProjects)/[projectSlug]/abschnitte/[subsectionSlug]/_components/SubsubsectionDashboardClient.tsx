"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsubsectionIcon } from "@/src/core/components/Map/Icons"
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
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { useQuery } from "@blitzjs/rpc"
import { SubsubsectionDetailsContent } from "./SubsubsectionDetailsContent"
import { SubsubsectionLandAcquisitionContent } from "./SubsubsectionLandAcquisitionContent"
import { SubsubsectionPageMap } from "./SubsubsectionPageMap"

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

  if ((subsectionLoading || subsubsectionLoading) && !subsubsection) {
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
          <SubsubsectionPageMap
            subsubsection={subsubsection}
            activeTab={activeTab}
          />
        </div>

        <div className="max-h-[calc(100vh-10rem)] min-w-0 flex-1 self-stretch">
          {activeTab === "land-acquisition" ? (
            <SubsubsectionLandAcquisitionContent
              subsectionId={subsection.id}
              subsubsectionId={subsubsection.id}
              subsubsectionType={subsubsection.type}
            />
          ) : (
            <SubsubsectionDetailsContent subsubsection={subsubsection} />
          )}
        </div>
      </div>

      <SuperAdminLogData
        data={{
          subsection,
          subsubsection,
        }}
      />
    </>
  )
}
