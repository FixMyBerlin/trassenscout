"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsectionMapIcon } from "@/src/core/components/Map/Icons"
import { SubsubsectionMapWithProvider } from "@/src/core/components/Map/SubsubsectionMapWithProvider"
import { getStaticOverlayForProject } from "@/src/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
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

type Props = {
  initialSubsections: Awaited<ReturnType<typeof getSubsections>>
  initialSubsubsections: Awaited<ReturnType<typeof getSubsubsections>>
}

export const SubsectionDashboardClient = ({ initialSubsections, initialSubsubsections }: Props) => {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()

  const [subsectionsResult] = useQuery(
    getSubsections,
    { projectSlug },
    {
      initialData: initialSubsections,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsections = subsectionsResult?.subsections ?? []
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  const [subsubsectionsResult] = useQuery(
    getSubsubsections,
    { projectSlug },
    {
      initialData: initialSubsubsections,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsubsections = subsubsectionsResult?.subsubsections ?? []
  const subsubsectionsForSubsection = subsubsections.filter(
    (subsub) => subsub.subsectionId === subsection?.id,
  )
  const subsubsection = subsubsectionsForSubsection.find((ss) => ss.slug === subsubsectionSlug)

  if (!subsection) {
    return null
  }

  const mapillaryHref = subsubsection && mapillaryLink(subsubsection)

  return (
    <>
      <Breadcrumb />
      <PageHeader
        titleIcon={<SubsectionMapIcon label={shortTitle(subsection.slug)} />}
        titleIconText={subsection.slug}
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
            subsubsections={subsubsections}
            staticOverlay={getStaticOverlayForProject(projectSlug)}
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
          subsubsectionsForSubsection,
          subsubsection,
        }}
      />
    </>
  )
}
