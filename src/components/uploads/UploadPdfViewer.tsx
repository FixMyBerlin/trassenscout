import { lazy, Suspense } from "react"
import { useIsHydrated } from "@/src/components/core/components/forms/hooks/useIsHydrated"
import type { UploadPdfViewerProps } from "./UploadPdfViewer.types"

const UploadPdfViewerClient = lazy(() =>
  import("./UploadPdfViewer.client").then((module) => ({
    default: module.UploadPdfViewer,
  })),
)

const pdfLoading = <p className="p-4 text-sm text-gray-500">PDF wird geladen …</p>

export const UploadPdfViewer = (props: UploadPdfViewerProps) => {
  const hydrated = useIsHydrated()

  if (!hydrated) {
    return pdfLoading
  }

  return (
    <Suspense fallback={pdfLoading}>
      <UploadPdfViewerClient {...props} />
    </Suspense>
  )
}
