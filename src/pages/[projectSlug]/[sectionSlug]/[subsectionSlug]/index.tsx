import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { proseClasses, quote } from "src/core/components/text"
import { H2 } from "src/core/components/text/Headings"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SectionsMap } from "src/projects/components/Map"
import type { BaseMapSections } from "src/projects/components/Map/BaseMapView"
import getSection from "src/sections/queries/getSection"
import getSections from "src/sections/queries/getSections"
import { StakeholderSectionStatus } from "src/stakeholdernotes/components/StakeholderSectionStatus"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import getSubsections from "src/subsections/queries/getSubsections"
import getSubsectionBySlugs from "src/subsections/queries/getSubsectionBySlugs"

export const SubsectionDashboard = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const subsectionSlug = useParam("subsectionSlug", "string")
  const [subsection] = useQuery(getSubsectionBySlugs, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    slug: subsectionSlug!,
    includeSubsubsections: true,
  })

  return (
    <>
      <MetaTags noindex title={subsection!.title} />
      <PageHeader title={subsection!.title} />

      <SuperAdminBox>
        <code>
          <pre>{JSON.stringify({ projectSlug, sectionSlug, subsectionSlug })}</pre>
          <pre>{JSON.stringify(subsection, null, 2)}</pre>
        </code>
      </SuperAdminBox>
    </>
  )
}

const SubsectionDashboardPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SubsectionDashboard />
      </Suspense>
    </LayoutRs>
  )
}

SubsectionDashboardPage.authenticate = true

export default SubsectionDashboardPage
