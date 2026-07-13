import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { UploadPdfViewer } from "@/src/components/uploads/UploadPdfViewer"
import { uploadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

const routeApi = getRouteApi("/_loggedInFullscreen/$projectSlug/uploads/$uploadId/view/")

export function PageUploadView() {
  const { projectSlug, uploadId } = routeApi.useParams()
  const { data: upload } = useSuspenseQuery(
    uploadQueryOptions({ projectSlug, id: Number(uploadId) }),
  )

  return (
    <UploadPdfViewer
      fileUrl={uploadUrl(upload, projectSlug)}
      layout="fullscreen"
      fit
      toolbar={{
        start: (
          <Link icon="back" to="/$projectSlug/uploads" params={{ projectSlug }}>
            Zurück zu den Dokumenten
          </Link>
        ),
        zoom: true,
        rotation: true,
        download: true,
      }}
    />
  )
}
