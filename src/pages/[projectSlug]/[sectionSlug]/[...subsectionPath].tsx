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
import { SubsectionMap } from "src/projects/components/Map/SubsectionMap"
import { SubsubsectionSidebar } from "src/projects/components/Map/SubsubsectionSidebar"
import getSectionsIncludeSubsections from "src/sections/queries/getSectionsIncludeSubsections"
import { StakeholderSection } from "src/stakeholdernotes/components/StakeholderSection"
import { StakeholderSummary } from "src/stakeholdernotes/components/StakeholderSummary"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import { SubsubsectionTable } from "src/subsections/components/SubsubsectionTable"
import getSubsectionIncludeSubsubsections from "src/subsections/queries/getSubsectionIncludeSubsubsections"

// Page Renders Subsection _AND_ Subsubsection (as Panel)
export const SubsectionDashboardWithQuery = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const [{ sections: sectionsWithSubsections }] = useQuery(getSectionsIncludeSubsections, {
    where: { project: { slug: projectSlug! } },
  })
  const [subsectionWithSubsubsection] = useQuery(getSubsectionIncludeSubsubsections, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    subsectionSlug: subsectionSlug!,
  })
  const stakeholdernotes = useQuery(getStakeholdernotes, {
    subsectionId: subsectionWithSubsubsection.id,
  })[0].stakeholdernotes

  // Handle/Render Subsubsection
  const subsubsection = subsubsectionSlug
    ? subsectionWithSubsubsection.subsubsections.find((s) => s.slug === subsubsectionSlug)
    : undefined

  return (
    <>
      <MetaTags noindex title={subsectionWithSubsubsection!.title} />

      <Breadcrumb />
      <PageHeader
        title={subsectionWithSubsubsection!.title}
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
          <Markdown markdown={subsectionWithSubsubsection.description} className="mb-3" />
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
          selectedSubsection={subsectionWithSubsubsection}
        />

        {subsubsection ? (
          <SubsubsectionSidebar
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

      <SubsubsectionTable subsubsections={subsectionWithSubsubsection.subsubsections} />

      <StakeholderSection stakeholdernotes={stakeholdernotes} />

      <SuperAdminLogData data={{ subsectionWithSubsubsection, sectionsWithSubsections }} />
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
