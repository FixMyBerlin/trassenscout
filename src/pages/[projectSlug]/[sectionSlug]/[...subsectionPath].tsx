import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "src/core/components/Breadcrumb/Breadcrumb"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SubsectionMap } from "src/core/components/Map/SubsectionMap"
import { SubsubsectionMapSidebar } from "src/subsections/components/SubsubsectionMapSidebar"
import getSectionsIncludeSubsections from "src/sections/queries/getSectionsIncludeSubsections"
import { StakeholderSection } from "src/stakeholdernotes/components/StakeholderSection"
import { StakeholderSummary } from "src/stakeholdernotes/components/StakeholderSummary"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import { SubsubsectionTable } from "src/subsections/components/SubsubsectionTable"
import getSubsectionIncludeSubsubsections from "src/subsections/queries/getSubsectionIncludeSubsubsections"
import getFilesWithSubsections from "src/files/queries/getFilesWithSubsections"
import { FileTable } from "src/files/components/FileTable"
import { H2 } from "src/core/components/text"

// Page Renders Subsection _AND_ Subsubsection (as Panel)
export const SubsectionDashboardWithQuery = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const [{ sections: sectionsWithSubsections }] = useQuery(getSectionsIncludeSubsections, {
    where: { project: { slug: projectSlug! } },
  })
  const [subsection] = useQuery(getSubsectionIncludeSubsubsections, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    subsectionSlug: subsectionSlug!,
  })
  const stakeholdernotes = useQuery(getStakeholdernotes, {
    subsectionId: subsection.id,
  })[0].stakeholdernotes
  const [{ files }] = useQuery(getFilesWithSubsections, {
    projectSlug: projectSlug!,
    where: { subsectionId: subsection.id },
  })

  // Handle/Render Subsubsection
  const subsubsection = subsubsectionSlug
    ? subsection.subsubsections.find((s) => s.slug === subsubsectionSlug)
    : undefined

  return (
    <>
      <MetaTags noindex title={subsection!.title} />

      <Breadcrumb />
      <PageHeader
        title={subsection!.title}
        subtitle={`${subsection.start} ▸ ${subsection.end}`}
        action={
          <Link
            icon="edit"
            href={Routes.EditSubsectionPage({
              projectSlug: projectSlug!,
              sectionSlug: sectionSlug!,
              subsectionSlug: subsectionSlug!,
            })}
          >
            bearbeiten
          </Link>
        }
      />

      <PageDescription>
        <div className="flex gap-8">
          <Markdown markdown={subsection.description} className="leading-snug" />
          <div className="space-y-2">
            <StakeholderSummary stakeholdernotes={stakeholdernotes} />
            <p>
              <strong>Teilstreckenlänge:</strong> TODO
              {/* {subsection.length ? subsection.length + " km" : " k.A."} */}
            </p>
          </div>
        </div>
      </PageDescription>

      <div className="relative mt-12 flex h-96 w-full gap-4 sm:h-[500px]">
        <SubsectionMap
          // Make sure the map rerenders when we close the SubsectionSidebar
          key={`map-${Boolean(subsubsection)}`}
          sections={sectionsWithSubsections}
          selectedSubsection={subsection}
        />

        {subsubsection ? (
          <SubsubsectionMapSidebar
            subsubsection={subsubsection}
            onClose={() => {
              void router.push(
                Routes.SubsectionDashboardPage({
                  projectSlug: projectSlug!,
                  sectionSlug: sectionSlug!,
                  subsectionPath: [subsectionSlug!],
                }),
                undefined,
                { scroll: false }
              )
            }}
          />
        ) : null}
      </div>

      <SubsubsectionTable subsubsections={subsection.subsubsections} />

      <StakeholderSection stakeholdernotes={stakeholdernotes} />

      <section className="mt-12">
        <H2 className="mb-5">Relevante Dokumente</H2>
        <FileTable files={files} />
      </section>

      <SuperAdminLogData data={{ subsection, sectionsWithSubsections }} />
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
