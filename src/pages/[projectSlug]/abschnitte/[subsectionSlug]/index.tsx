import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "@/src/core/components/Breadcrumb/Breadcrumb"
import { SubsectionMapIcon } from "@/src/core/components/Map/Icons"
import { SubsectionSubsubsectionMap } from "@/src/core/components/Map/SubsectionSubsubsectionMap"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageDescription } from "@/src/core/components/pages/PageDescription"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H2, seoTitleSlug, shortTitle, startEnd } from "@/src/core/components/text"
import { useSlugs } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { SubsectionInfoPanel } from "@/src/subsections/components/SubsectionInfoPanel"
import { SubsectionTabs } from "@/src/subsections/components/SubsectionTabs"
import { SubsubsectionMapSidebar } from "@/src/subsections/components/SubsubsectionMapSidebar"
import getSubsections from "@/src/subsections/queries/getSubsections"
import { SubsubsectionTable } from "@/src/subsubsections/components/SubsubsectionTable"
import getSubsubsections from "@/src/subsubsections/queries/getSubsubsections"
import { UploadTable } from "@/src/uploads/components/UploadTable"
import getUploadsWithSubsections from "@/src/uploads/queries/getUploadsWithSubsections"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

// Page Renders Subsection _AND_ Subsubsection (as Panel)
export const SubsectionDashboardWithQuery = () => {
  const router = useRouter()
  const { projectSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const [{ subsections }] = useQuery(getSubsections, { projectSlug: projectSlug! })
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  const [{ subsubsections }] = useQuery(getSubsubsections, {
    projectSlug: projectSlug!,
  })
  const subsubsectionsForSubsection = subsubsections.filter(
    (subsub) => subsub.subsectionId === subsection?.id,
  )
  const subsubsection = subsubsectionsForSubsection.find((ss) => ss.slug === subsubsectionSlug)

  const [{ uploads }] = useQuery(getUploadsWithSubsections, {
    projectSlug: projectSlug!,
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
        subtitle={subsection.operator?.title}
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              href={Routes.EditSubsectionPage({
                projectSlug: projectSlug!,
                subsectionSlug: subsectionSlug!,
              })}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        description={
          <>
            <details>
              <summary className="mt-6 cursor-pointer">Info & Auswertung</summary>
              <SubsectionInfoPanel />
            </details>
            <SubsectionTabs />
          </>
        }
      />

      {subsection.description && (
        <PageDescription>
          <div className="flex gap-8">
            <Markdown markdown={subsection.description} className="leading-snug" />
          </div>
        </PageDescription>
      )}

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
                  projectSlug: projectSlug!,
                  subsectionSlug: subsectionSlug!,
                }),
                undefined,
                { scroll: false },
              )
            }}
          />
        )}
      </div>

      <section className="mt-12">
        <H2 className="mb-5">Relevante Dokumente</H2>
        <UploadTable uploads={uploads} />
      </section>

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
  const { subsectionSlug } = useSlugs()
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
