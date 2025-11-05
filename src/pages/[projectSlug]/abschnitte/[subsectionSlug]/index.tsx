import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsectionMapIcon } from "@/src/core/components/Map/Icons"
import { SubsectionSubsubsectionMap } from "@/src/core/components/Map/SubsectionSubsubsectionMap"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H2, seoTitleSlug, shortTitle, startEnd } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { SubsubsectionMapSidebar } from "@/src/pagesComponents/subsections/SubsubsectionMapSidebar"
import { SubsubsectionTable } from "@/src/pagesComponents/subsubsections/SubsubsectionTable"
import { UploadTable } from "@/src/pagesComponents/uploads/UploadTable"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
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

  const [{ uploads }] = useQuery(getUploadsWithSubsections, {
    projectSlug,
    where: { subsectionId: subsection?.id },
  })

  if (!subsection) {
    return <Spinner page />
  }

  return (
    <>
      <MetaTags noindex title={seoTitleSlug(subsection.slug)} />

      <Breadcrumb />
      <PageHeader
        titleIcon={<SubsectionMapIcon label={shortTitle(subsection.slug)} />}
        title={startEnd(subsection)}
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
          <>
            {subsection.description && <div className="mt-4">{subsection.description}</div>}
            {/* <SubsectionTabs /> */}
          </>
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

      {!!uploads.length && (
        <section className="mt-12">
          <H2 className="mb-5">Relevante Dokumente</H2>
          <UploadTable withAction={false} withSubsectionColumn={false} uploads={uploads} />
        </section>
      )}

      <SuperAdminLogData
        data={{
          subsections,
          subsection,
          subsubsections,
          subsubsectionsForSubsection,
          subsubsection,
          uploads,
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
