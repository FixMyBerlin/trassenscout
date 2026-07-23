import { getRouteApi } from "@tanstack/react-router"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { EditAcquisitionAreaForm } from "@/src/components/abschnitte/acquisition-areas/EditAcquisitionAreaForm"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/$acquisitionAreaId/edit/",
)

export function PageAbschnitteAcquisitionAreaEdit() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = routeApi.useParams()
  const { acquisitionArea } = routeApi.useLoaderData()
  return (
    <>
      <PageHeader
        breadcrumb={<AbschnitteBreadcrumb current="Grunderwerb" />}
        info="Erstellen Sie automatisch neue Verhandlungsflächen durch einen räumlichen Abgleich mit den ALKIS-Flurstücken."
        title="Verhandlungsfläche bearbeiten"
        className="mb-0 shrink-0"
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
