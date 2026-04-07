"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { Notice } from "@/src/core/components/Notice/Notice"
import { Spinner } from "@/src/core/components/Spinner"
import { SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { SubsubsectionMapWithProvider } from "@/src/core/components/Map/SubsubsectionMapWithProvider"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { subsubsectionEditRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { SubsubsectionDetailsContent } from "./SubsubsectionDetailsContent"

const defaultQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
}

export const SubsubsectionDashboardClient = () => {
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

      <div className="relative mt-12 flex w-full items-start gap-6">
        <div className="min-w-0 flex-1">
          <SubsubsectionMapWithProvider
            key={`map-subsubsection-${subsubsectionSlug}`}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
          />
        </div>

        <div className="min-w-0 flex-1 self-stretch max-h-[calc(100vh-10rem)]">
          <SubsubsectionDetailsContent
            subsubsection={subsubsection}
            header={
              <div className="flex items-center justify-between gap-3 px-1 pt-1 pb-2">
                <h2 className="text-lg font-semibold text-gray-700">Allgemeines</h2>
                <IfUserCanEdit>
                  <Link
                    icon="edit"
                    href={subsubsectionEditRoute(projectSlug, subsectionSlug!, subsubsectionSlug!)}
                  >
                    bearbeiten
                  </Link>
                </IfUserCanEdit>
              </div>
            }
          />
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
