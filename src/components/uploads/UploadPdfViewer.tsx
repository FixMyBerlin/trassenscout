/**
 * SSR boundary for the PDF viewer — import this file from routes/components, not
 * `UploadPdfViewer.client.tsx`.
 *
 * The `.client` module configures pdf.js and react-pdf at import time, so it cannot
 * run on the server. `<ClientOnly>` renders the fallback during SSR and mounts the
 * real viewer after hydration.
 *
 * Do not add lazy(), Suspense, useIsHydrated, or createClientOnlyFn here. Lazy is
 * for code-splitting heavy bundles, not for client/server boundaries. See
 * `.agents/skills/tanstack-start-conventions/references/client-server-boundaries.md`.
 */
import { ClientOnly } from "@tanstack/react-router"
import { UploadPdfViewer as UploadPdfViewerClient } from "./UploadPdfViewer.client"
import type { UploadPdfViewerProps } from "./UploadPdfViewer.types"

const pdfLoading = <p className="p-4 text-sm text-gray-500">PDF wird geladen …</p>

export const UploadPdfViewer = (props: UploadPdfViewerProps) => (
  <ClientOnly fallback={pdfLoading}>
    <UploadPdfViewerClient {...props} />
  </ClientOnly>
)
