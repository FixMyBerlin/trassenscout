import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { EditUploadForm } from "@/src/components/uploads/EditUploadForm"
import { getUploadReturnTarget } from "@/src/components/uploads/getUploadReturnTarget"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/uploads/$uploadId/edit/")

export function PageUploadEdit() {
  const { projectSlug, uploadId } = routeApi.useParams()
  const search = routeApi.useSearch()
  const { data: upload } = useSuspenseQuery(
    uploadQueryOptions({ projectSlug, id: Number(uploadId) }),
  )

  const { returnPath, returnText } = getUploadReturnTarget({
    projectSlug,
    returnTo: search.returnTo,
  })

  return (
    <>
      <PageHeader
        title="Dokument bearbeiten"
        titleVisuallyHidden
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Dokumente"
            sectionTo="/$projectSlug/uploads"
            current="bearbeiten"
          />
        }
      />
      <EditUploadForm
        upload={upload}
        projectSlug={projectSlug}
        returnPath={returnPath}
        returnText={returnText}
      />
    </>
  )
}
