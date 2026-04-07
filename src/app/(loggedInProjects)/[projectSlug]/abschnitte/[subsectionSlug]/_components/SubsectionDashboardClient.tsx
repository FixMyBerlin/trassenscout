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
import { SubsectionUploadsSection } from "./SubsectionUploadsSection"
import { SubsubsectionTable } from "./SubsubsectionTable"

export const SubsectionDashboardClient = () => {
  const subsectionSlug = useSlug("subsectionSlug")
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

  const [subsubsectionsResult, { isLoading: subsubsectionsLoading }] = useQuery(
    getSubsubsections,
    { projectSlug, where: { subsectionId: subsection?.id } },
    {
      enabled: !!subsection,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsubsections = subsubsectionsResult?.subsubsections ?? []
  const subsubsectionsHasMore = subsubsectionsResult?.hasMore
  const subsubsectionsCount = subsubsectionsResult?.count

  if ((subsectionsLoading || subsubsectionsLoading) && !subsection) {
    return <Spinner page />
  }
  if (!subsection) {
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
            key="map-subsection"
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
          />
          <SubsubsectionTable subsubsections={subsubsections} compact={false} />
        </div>
      </div>

      <SubsectionUploadsSection subsectionId={subsection.id} />

      <SuperAdminLogData
        data={{
          subsections,
          subsection,
          subsubsections,
        }}
      />
    </>
  )
}
