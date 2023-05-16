import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Breadcrumb } from "src/core/components/Breadcrumb/Breadcrumb"
import { SectionMapIcon } from "src/core/components/Map/Icons"
import { SectionMap } from "src/core/components/Map/SectionMap"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SubsectionTable } from "src/sections/components/SubsectionTable"
import getSection from "src/sections/queries/getSection"
import getSectionsIncludeSubsections from "src/sections/queries/getSectionsIncludeSubsections"
import getSubsections from "src/subsections/queries/getSubsections"

export const SectionDashboardWithQuery = () => {
  const { projectSlug, sectionSlug } = useSlugs()

  // TODO: Refactor to remove this getSection an use the getSectionsIncludeSubsections + selectedSectionWithSubsections only
  const [section] = useQuery(getSection, { projectSlug: projectSlug!, sectionSlug: sectionSlug! })

  // TODO: Having both those calls is weird; Ideally change the getSectionS to getSection "include subsections".
  const [{ sections: sectionsWithSubsections }] = useQuery(getSectionsIncludeSubsections, {
    where: { project: { slug: projectSlug! } },
  }) // TODO make project required
  const [{ subsections }] = useQuery(getSubsections, {
    where: { sectionId: section.id },
  }) // TODO make project required

  const selectedSectionWithSubsections = sectionsWithSubsections.find((s) => s.id === section.id)

  return (
    <>
      <MetaTags noindex title={section.title} />

      <Breadcrumb />
      <PageHeader
        titleIcon={<SectionMapIcon label={`TS${section.id}`} />}
        title={section.title}
        subtitle={`${section.subTitle} - ${section.start} ▸ ${section.end}`}
        action={
          <Link
            icon="edit"
            href={Routes.EditSectionPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}
          >
            bearbeiten
          </Link>
        }
      />

      <PageDescription>
        <div className="flex gap-8">
          <Markdown markdown={section.description} className="mb-3" />
          <div className="space-y-2">
            <p>
              <strong>Teilstreckenlänge:</strong>{" "}
              {section.length ? section.length + " km" : " k.A."}
            </p>
          </div>
        </div>
      </PageDescription>

      <SectionMap
        sections={sectionsWithSubsections}
        selectedSection={selectedSectionWithSubsections}
      />

      <SubsectionTable subsections={subsections} />

      <SuperAdminLogData data={{ sectionsWithSubsections, subsections }} />
    </>
  )
}

const SectionDashboardPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SectionDashboardWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SectionDashboardPage.authenticate = true

export default SectionDashboardPage
