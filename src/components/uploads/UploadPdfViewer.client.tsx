import {
  ArrowPathIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { getPdfWorkerSrc } from "@/src/components/core/pdf/getPdfWorkerSrc"
import type { UploadPdfViewerProps } from "./UploadPdfViewer.types"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = getPdfWorkerSrc()

const MIN_ZOOM = 0.5
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1

export const UploadPdfViewer = ({
  fileUrl,
  layout = "normal",
  toolbar = {},
  initial = {},
  fit = false,
}: UploadPdfViewerProps) => {
  const { start, zoom = false, rotation = false, download = false } = toolbar
  const { page = 1, zoom: initialZoom = 100 } = initial

  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState(page)
  const [zoomLevel, setZoomLevel] = useState(() =>
    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initialZoom / 100)),
  )
  const [pageRotation, setPageRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>()
  const [containerHeight, setContainerHeight] = useState<number>()
  // Intrinsic page aspect ratio (width / height) at rotation 0, from the loaded page.
  const [pageAspectRatio, setPageAspectRatio] = useState<number>()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return
      setContainerWidth(entry.contentRect.width)
      setContainerHeight(entry.contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const effectiveZoom = zoom ? zoomLevel : 1
  const effectiveRotation = rotation ? pageRotation : 0

  // Base width handed to <Page> before the zoom factor is applied.
  let baseWidth = containerWidth
  if (fit && containerWidth && containerHeight && pageAspectRatio) {
    // Account for 90°/270° rotation swapping the page's width and height.
    const rotated = effectiveRotation % 180 !== 0
    const aspect = rotated ? 1 / pageAspectRatio : pageAspectRatio
    // Width that would make the page exactly as tall as the container.
    const widthConstrainedByHeight = containerHeight * aspect
    // Fit within both dimensions so the whole page is visible on initial render.
    baseWidth = Math.min(containerWidth, widthConstrainedByHeight)
  }

  const toolbarNav = (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      <button
        type="button"
        className={linkStyles}
        disabled={pageNumber <= 1}
        onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
      >
        ←
      </button>
      <span>
        Seite {pageNumber} von {numPages ?? "–"}
      </span>
      <button
        type="button"
        className={linkStyles}
        disabled={!numPages || pageNumber >= numPages}
        onClick={() => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p))}
      >
        →
      </button>

      {zoom && (
        <>
          <span className="mx-2 text-gray-300">|</span>

          <button
            type="button"
            className={linkStyles}
            disabled={zoomLevel <= MIN_ZOOM}
            onClick={() => setZoomLevel((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          >
            <MagnifyingGlassMinusIcon className="size-4" />
          </button>
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button
            type="button"
            className={linkStyles}
            disabled={zoomLevel >= MAX_ZOOM}
            onClick={() => setZoomLevel((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          >
            <MagnifyingGlassPlusIcon className="size-4" />
          </button>
        </>
      )}

      {rotation && (
        <>
          <span className="mx-2 text-gray-300">|</span>

          <button
            type="button"
            className={linkStyles}
            onClick={() => setPageRotation((r) => (r + 90) % 360)}
          >
            <ArrowPathIcon className="size-4" />
          </button>
        </>
      )}

      {download && (
        <>
          <span className="mx-2 text-gray-300">|</span>

          <Link blank icon="download" href={fileUrl}>
            <span className="sr-only">Download</span>
          </Link>
        </>
      )}
    </nav>
  )

  const isFullscreen = layout === "fullscreen"

  return (
    <div className={twJoin(isFullscreen ? "flex h-full flex-col" : "h-full space-y-2")}>
      {isFullscreen ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-300 bg-gray-50 px-4 py-3">
          {start}
          {toolbarNav}
        </div>
      ) : (
        toolbarNav
      )}

      <div
        ref={containerRef}
        className={twJoin(
          "w-full overflow-auto bg-gray-50",
          isFullscreen ? "min-h-0 flex-1" : "h-full rounded border border-blue-500",
        )}
      >
        <div className="grid min-h-full min-w-full">
          <Document
            className="m-auto"
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p className="p-4 text-sm text-gray-500">PDF wird geladen …</p>}
            error={<p className="p-4 text-sm text-red-600">PDF konnte nicht geladen werden.</p>}
            noData={<p className="p-4 text-sm text-gray-500">Keine PDF-Datei.</p>}
          >
            {baseWidth && (
              <Page
                pageNumber={pageNumber}
                width={baseWidth}
                scale={effectiveZoom}
                rotate={effectiveRotation}
                onLoadSuccess={(page) =>
                  setPageAspectRatio(page.originalWidth / page.originalHeight)
                }
              />
            )}
          </Document>
        </div>
      </div>
    </div>
  )
}
