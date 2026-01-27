import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsectionMapIcon } from "@/src/core/components/Map/Icons"
import { SubsectionSubsubsectionMap } from "@/src/core/components/Map/SubsectionSubsubsectionMap"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoTitleSlug, shortTitle, startEnd } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { SubsectionUploadsSection } from "@/src/pagesComponents/subsections/SubsectionUploadsSection"
import { SubsubsectionMapSidebar } from "@/src/pagesComponents/subsections/SubsubsectionMapSidebar"
import { mapillaryLink } from "@/src/pagesComponents/subsections/utils/mapillaryLink"
import { SubsubsectionTable } from "@/src/pagesComponents/subsubsections/SubsubsectionTable"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

// Page Renders Subsection _AND_ Subsubsection (as Panel)
export const SubsectionDashboardWithQuery = () => {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()

  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  const [{ subsubsections }] = useQuery(getSubsubsections, {
    projectSlug,
  })
  const subsubsectionsForSubsection = subsubsections.filter(
    (subsub) => subsub.subsectionId === subsection?.id,
  )
  const subsubsection = subsubsectionsForSubsection.find((ss) => ss.slug === subsubsectionSlug)

  if (!subsection) {
    return <Spinner page />
  }

  const mapillaryHref = subsubsection && mapillaryLink(subsubsection)

  return (
    <>
      <MetaTags noindex title={seoTitleSlug(subsection.slug)} />

      <Breadcrumb />
      <PageHeader
        titleIcon={<SubsectionMapIcon label={shortTitle(subsection.slug)} />}
        titleIconText={startEnd(subsection)}
        className="mt-12"
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              href={Routes.EditSubsectionPage({
                projectSlug,
                subsectionSlug: subsectionSlug!,
              })}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        description={
          <>{subsection.description && <div className="mt-4">{subsection.description}</div>}</>
        }
      />

      <div className="relative mt-12 flex w-full gap-10">
        <div className="w-full">
          <SubsectionSubsubsectionMap
            // Make sure the map rerenders when we close the SubsectionSidebar
            key={`map-${subsubsectionSlug ? "subsubsection" : "subsection"}`}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
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
              void router.push(
                Routes.SubsectionDashboardPage({
                  projectSlug,
                  subsectionSlug: subsectionSlug!,
                }),
                undefined,
                { scroll: false },
              )
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

const SubsectionDashboardPage: BlitzPage = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  if (subsectionSlug === undefined) return null

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SubsectionDashboardWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SubsectionDashboardPage.authenticate = true

export default SubsectionDashboardPage
