import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SubsectionMap } from "src/projects/components/Map/SubsectionMap"
import getSubsectionBySlugs from "src/subsections/queries/getSubsectionBySlugs"
import {
  Subsection as SubsectionClient,
  Subsubsection as SubsubsectionClient,
} from "@prisma/client"
import { Position } from "@turf/helpers"

export interface Subsubsection extends Omit<SubsubsectionClient, "geometry"> {
  geometry: Position[]
}

export interface Subsection extends Omit<SubsectionClient, "geometry"> {
  geometry: Position[]
  subsubsections: Subsubsection[]
}

export const SubsectionDashboard = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const subsectionSlug = useParam("subsectionSlug", "string")
  const [subsectionOrg] = useQuery(getSubsectionBySlugs, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    slug: subsectionSlug!,
    includeSubsubsections: true,
  })

  const subsection: Subsection = JSON.parse(JSON.stringify(subsectionOrg)) // deep copy
  subsection.geometry = subsection.geometry ? JSON.parse(subsection.geometry) : null
  subsection.subsubsections.forEach((subsubsection) => {
    subsubsection.geometry = subsubsection.geometry ? JSON.parse(subsubsection.geometry) : null
  })

  return (
    <>
      <MetaTags noindex title={subsection!.title} />
      <PageHeader title={subsection!.title} />

      <div className="mb-12 flex h-96 w-full gap-4 sm:h-[500px]">
        <SubsectionMap sections={[]} selectedSection={subsection} />
      </div>

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
