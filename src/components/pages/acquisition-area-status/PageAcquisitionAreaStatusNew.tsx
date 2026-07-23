import { getRouteApi } from "@tanstack/react-router"
import { NewAcquisitionAreaStatusForm } from "@/src/components/acquisition-area-status/NewAcquisitionAreaStatusForm"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/acquisition-area-status/new/")

export function PageAcquisitionAreaStatusNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Flächenerwerb-Status"
            sectionTo="/$projectSlug/acquisition-area-status"
            current="neu"
          />
        }
      />
      <NewAcquisitionAreaStatusForm projectSlug={projectSlug} />
    </>
  )
}
