import { lazy, Suspense, useState } from "react"
import { Link } from "@/src/components/core/components/links/Link"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { Img } from "@/src/components/shared/Img"
import type { ExternalShareUpload } from "@/src/server/externalShare/types"

const UploadPdfViewer = lazy(() =>
  import("@/src/components/uploads/UploadPdfViewer").then((module) => ({
    default: module.UploadPdfViewer,
  })),
)

type Props = {
  upload: ExternalShareUpload | null
  fileUrl: string
  downloadUrl: string
  onClose: () => void
}

export const ExternalSharePreviewModal = ({ upload, fileUrl, downloadUrl, onClose }: Props) => {
  const [imageFailed, setImageFailed] = useState(false)
  if (!upload) return null

  return (
    <Modal open handleClose={onClose} className="sm:max-w-4xl">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
        <h3 className="min-w-0 text-base font-semibold break-all text-gray-900">{upload.title}</h3>
        <ModalCloseButton onClose={onClose} />
      </div>
      <div className="p-4">
        {upload.previewKind === "image" && !imageFailed ? (
          <Img
            src={fileUrl}
            alt={upload.title}
            className="mx-auto max-h-[70vh] object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : upload.previewKind === "pdf" ? (
          <Suspense fallback={<p className="text-sm text-gray-600">Vorschau wird geladen …</p>}>
            <UploadPdfViewer fileUrl={fileUrl} toolbar={{ zoom: true }} />
          </Suspense>
        ) : (
          <p className="text-sm text-gray-600">Für diesen Dateityp gibt es keine Vorschau.</p>
        )}
      </div>
      <div className="border-t border-gray-200 p-4">
        <Link icon="download" href={downloadUrl}>
          Download
        </Link>
      </div>
    </Modal>
  )
}
