"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsectionMapIcon } from "@/src/core/components/Map/Icons"
import { SubsubsectionMapWithProvider } from "@/src/core/components/Map/SubsubsectionMapWithProvider"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { Notice } from "@/src/core/components/Notice/Notice"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { shortTitle } from "@/src/core/components/text"
import { subsectionEditRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { mapillaryLink } from "../_utils/mapillaryLink"
import { SubsectionUploadsSection } from "./SubsectionUploadsSection"
import { SubsubsectionMapSidebar } from "./SubsubsectionMapSidebar"
import { SubsubsectionTable } from "./SubsubsectionTable"

export const SubsectionDashboardClient = () => {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()

  const [subsectionsResult, { isLoading: subsectionsLoading }] = useQuery(
    getSubsections,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsections = subsectionsResult?.subsections ?? []
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  // QUERY 1: All subsubsections for the map (max 249 - default of query)
  // The map component needs ALL subsubsections for the entire project to render
  // the full geometry/overlay. We accept that with very large projects, some
  // might be missing (visual degradation), but the map remains functional and a notice is shown.
  const [subsubsectionsResult, { isLoading: subsubsectionsLoading }] = useQuery(
    getSubsubsections,
    { projectSlug, take: 249 },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsubsections = subsubsectionsResult?.subsubsections ?? []
  const subsubsectionsHasMore = subsubsectionsResult?.hasMore
  const subsubsectionsCount = subsubsectionsResult?.count

  // QUERY 2: server-side filtered subsubsections for the table/sidebar (max 249 - default of query)
  // Ensure selected subsection's subsubsections are always fully loaded for the table and sidebar, even in large projects.
  const [filteredSubsubsectionsResult, { isLoading: filteredSubsubsectionsLoading }] = useQuery(
    getSubsubsections,
    { projectSlug, where: { subsectionId: subsection?.id } },
    {
      enabled: !!subsection,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsubsectionsForSubsection = filteredSubsubsectionsResult?.subsubsections ?? []
  const subsubsection = subsubsectionsForSubsection.find((ss) => ss.slug === subsubsectionSlug)

  // Merge: ensure all subsubsections from the current subsection are in the map data,
  // even if they were truncated in Query 1.
  const subsubsectionsForMap = [
    ...subsubsections,
    ...subsubsectionsForSubsection.filter(
      (filtered) => !subsubsections.some((ss) => ss.id === filtered.id),
    ),
  ]

  if (
    (subsectionsLoading || subsubsectionsLoading || filteredSubsubsectionsLoading) &&
    !subsection
  ) {
    return <Spinner page />
  }
  if (!subsection) {
    return null
  }

  const mapillaryHref = subsubsection && mapillaryLink(subsubsection)

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
        titleIcon={<SubsectionMapIcon label={shortTitle(subsection.slug)} />}
        className="mt-12"
        action={
          <IfUserCanEdit>
            <Link icon="edit" href={subsectionEditRoute(projectSlug, subsectionSlug!)}>
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        description={
          subsection.description ? <Markdown markdown={subsection.description} /> : undefined
        }
      />

      <div className="relative mt-12 flex w-full gap-10">
        <div className="w-full">
          <SubsubsectionMapWithProvider
            key={`map-${subsubsectionSlug ? "subsubsection" : "subsection"}`}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsectionsForMap}
          />
          {mapillaryHref && (
            <Link blank href={mapillaryHref} className="block text-xs">
              Mapillary öffnen
            </Link>
          )}
          <SubsubsectionTable
            subsubsections={subsubsectionsForSubsection}
            compact={Boolean(subsubsection)}
          />
        </div>

        {subsubsection && (
          <SubsubsectionMapSidebar
            subsubsection={subsubsection}
            onClose={() => {
              router.push(`/${projectSlug}/abschnitte/${subsectionSlug}`, { scroll: false })
            }}
          />
        )}
      </div>

      <SubsectionUploadsSection subsectionId={subsection.id} />

      <SuperAdminLogData
        data={{
          subsections,
          subsection,
          subsubsections,
          subsubsectionsForMap,
          subsubsectionsForSubsection,
          subsubsection,
        }}
      />
    </>
  )
}
