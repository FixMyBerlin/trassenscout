import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "src/core/components/Breadcrumb/Breadcrumb"
import { SubsectionMapIcon } from "src/core/components/Map/Icons"
import { SubsectionSubsubsectionMap } from "src/core/components/Map/SubsectionSubsubsectionMap"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2, longTitle, seoTitleSlug, shortTitle, startEnd } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileTable } from "src/files/components/FileTable"
import getFilesWithSubsections from "src/files/queries/getFilesWithSubsections"
import { StakeholderSection } from "src/stakeholdernotes/components/StakeholderSection"
import { StakeholderSummary } from "src/stakeholdernotes/components/StakeholderSummary"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import { SubsubsectionMapSidebar } from "src/subsections/components/SubsubsectionMapSidebar"
import getSubsections from "src/subsections/queries/getSubsections"
import { SubsubsectionTable } from "src/subsubsections/components/SubsubsectionTable"
import getSubsubsections from "src/subsubsections/queries/getSubsubsections"

// Page Renders Subsection _AND_ Subsubsection (as Panel)
export const SubsectionDashboardWithQuery = () => {
  const router = useRouter()
  const { projectSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const [{ subsections }] = useQuery(getSubsections, { projectSlug: projectSlug! })
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  const [{ subsubsections }] = useQuery(getSubsubsections, {
    projectSlug: projectSlug!,
    subsectionSlug: subsectionSlug!,
  })
  const subsubsection = subsubsections.find((ss) => ss.slug === subsubsectionSlug)

  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, { subsectionId: subsection?.id })
  const [{ files }] = useQuery(getFilesWithSubsections, {
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
        subtitle={subsection.operator?.title}
        action={
          <Link
            icon="edit"
            href={Routes.EditSubsectionPage({
              projectSlug: projectSlug!,
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
            {/* <p>
                <strong>Teilstreckenlänge:</strong> TODO
              </p> */}
          </div>
        </div>
      </PageDescription>

      <div className="relative mt-12 flex w-full gap-10">
        <div className="w-full">
          <SubsectionSubsubsectionMap
            // Make sure the map rerenders when we close the SubsectionSidebar
            key={`map-${subsubsectionSlug ? "subsubsection" : "subsection"}`}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
          />
          <SubsubsectionTable subsubsections={subsubsections} compact={Boolean(subsubsection)} />
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
                { scroll: false }
              )
            }}
          />
        )}
      </div>

      <StakeholderSection stakeholdernotes={stakeholdernotes} />

      <section className="mt-12">
        <H2 className="mb-5">Relevante Dokumente</H2>
        <FileTable files={files} />
      </section>

      <SuperAdminLogData data={{ subsectionSlug }} />
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
