import { getRouteApi } from "@tanstack/react-router"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { EditAcquisitionAreaForm } from "@/src/components/abschnitte/acquisition-areas/EditAcquisitionAreaForm"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/$acquisitionAreaId/edit/",
)

export function PageAbschnitteAcquisitionAreaEdit() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = routeApi.useParams()
  const { acquisitionArea } = routeApi.useLoaderData()
  return (
    <>
      <PageHeader
        breadcrumb={<AbschnitteBreadcrumb />}
        title={`Verhandlungsfläche ${acquisitionArea.id} bearbeiten`}
      />
      <EditAcquisitionAreaForm
        acquisitionArea={acquisitionArea}
        projectSlug={projectSlug}
        subsectionSlug={subsectionSlug}
        subsubsectionSlug={subsubsectionSlug}
      />
    </>
  )
}
