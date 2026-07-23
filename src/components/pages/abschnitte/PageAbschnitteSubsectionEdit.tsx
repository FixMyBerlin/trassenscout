import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { EditSubsectionForm } from "@/src/components/abschnitte/EditSubsectionForm"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/edit/")

export function PageAbschnitteSubsectionEdit() {
  const { projectSlug, subsectionSlug } = routeApi.useParams()
  const { data: subsection } = useSuspenseQuery(
    subsectionBySlugQueryOptions({ projectSlug, subsectionSlug }),
  )
  return (
    <>
      <PageHeader breadcrumb={<AbschnitteBreadcrumb current="bearbeiten" />} />
      <EditSubsectionForm subsection={subsection} projectSlug={projectSlug} />
      <div className={pageContentPaddingClassName}>
        <SuperAdminLogData data={subsection} />
      </div>
    </>
  )
}
