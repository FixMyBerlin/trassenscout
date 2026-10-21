import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { getUploadReturnTarget } from "@/src/components/uploads/getUploadReturnTarget"
import { UploadPdfViewer } from "@/src/components/uploads/UploadPdfViewer"
import { uploadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

const routeApi = getRouteApi("/_loggedInFullscreen/$projectSlug/uploads/$uploadId/view/")

export function PageUploadView() {
  const { projectSlug, uploadId } = routeApi.useParams()
  const { returnTo } = routeApi.useSearch()
  const { data: upload } = useSuspenseQuery(
    uploadQueryOptions({ projectSlug, id: Number(uploadId) }),
  )
  const { returnPath, returnText } = getUploadReturnTarget({ projectSlug, returnTo })

  return (
    <UploadPdfViewer
      fileUrl={uploadUrl(upload, projectSlug)}
      layout="fullscreen"
      fit
      toolbar={{
        start: (
          <Link icon="back" to={returnPath}>
            {returnText}
          </Link>
        ),
        zoom: true,
        rotation: true,
        download: true,
      }}
    />
  )
}
