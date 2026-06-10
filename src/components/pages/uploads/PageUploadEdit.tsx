import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { EditUploadForm } from "@/src/components/uploads/EditUploadForm"
import {
  getUploadReturnTarget,
  parseReturnProjectRecordId,
} from "@/src/components/uploads/getUploadReturnTarget"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { isProjectScopedReturnPath } from "@/src/shared/routing/sanitizeReturnTo"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/uploads/$uploadId/edit/")

export function PageUploadEdit() {
  const { projectSlug, uploadId } = routeApi.useParams()
  const search = routeApi.useSearch()
  const { data: upload } = useSuspenseQuery(
    uploadQueryOptions({ projectSlug, id: Number(uploadId) }),
  )

  const { returnPath, returnText } = getUploadReturnTarget({
    projectSlug,
    returnTo:
      search.returnTo && isProjectScopedReturnPath(search.returnTo, projectSlug)
        ? search.returnTo
        : undefined,
    returnProjectRecordId: parseReturnProjectRecordId(search.returnProjectRecordId),
  })

  return (
    <>
      <PageHeader title="Dokument bearbeiten" />
      <EditUploadForm upload={upload} returnPath={returnPath} returnText={returnText} />
    </>
  )
}
