import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { SubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsectionIcon"
import { SubsubsectionMapWithProvider } from "@/src/components/core/components/Map/SubsubsectionMapWithProvider"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { IfUserCanEdit } from "@/src/components/shared/memberships/IfUserCan"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import type { SubsectionsList } from "@/src/server/subsections/types"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { SubsubsectionTable } from "./SubsubsectionTable"

const subsectionRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/",
)

type Subsection = SubsectionsList[number]

function SubsectionDashboardContent({
  projectSlug,
  subsectionSlug,
  subsection,
  subsections,
}: {
  projectSlug: string
  subsectionSlug: string
  subsection: Subsection
  subsections: SubsectionsList
}) {
  const { data: subsubsections } = useSuspenseQuery(
    subsubsectionsQueryOptions({ projectSlug, subsectionId: subsection.id }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={<AbschnitteBreadcrumb />}
        heading={<SubsectionIcon label={shortTitle(subsection.slug)} />}
        action={
          <IfUserCanEdit>
            <Link
              button="white"
              icon="edit"
              to="/$projectSlug/abschnitte/$subsectionSlug/edit"
              params={{ projectSlug, subsectionSlug }}
            >
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
            key="map-subsection"
            projectSlug={projectSlug}
            subsectionSlug={subsectionSlug}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
          />
          <SubsubsectionTable subsubsections={subsubsections} compact={false} />
        </div>
      </div>
      <SuperAdminLogData data={{ subsections, subsection, subsubsections }} />
    </>
  )
}

export const SubsectionDashboardClient = () => {
  const { projectSlug, subsectionSlug } = subsectionRouteApi.useParams()
  const { data: subsections } = useSuspenseQuery(subsectionsQueryOptions({ projectSlug }))
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  if (!subsection) return null

  return (
    <SubsectionDashboardContent
      projectSlug={projectSlug}
      subsectionSlug={subsectionSlug}
      subsection={subsection}
      subsections={subsections}
    />
  )
}
