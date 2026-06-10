import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { EditSubsectionForm } from "@/src/components/abschnitte/EditSubsectionForm"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/edit/")

export function PageAbschnitteSubsectionEdit() {
  const { projectSlug, subsectionSlug } = routeApi.useParams()
  const { data: subsection } = useSuspenseQuery(
    subsectionBySlugQueryOptions({ projectSlug, subsectionSlug }),
  )
  return (
    <>
      <PageHeader title={`${shortTitle(subsection.slug)} bearbeiten`} />
      <EditSubsectionForm subsection={subsection} projectSlug={projectSlug} />
      <SuperAdminLogData data={subsection} />
    </>
  )
}
