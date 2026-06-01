"use client"

import { linkStyles } from "@/src/core/components/links"
import {
  ArrowPathIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Tell PDF.js where to load its Web Worker from. We serve it as a static asset
// from /public, copied there by the `copyPdfWorker` script in package.json
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.1

type Props = {
  fileUrl: string
  showZoomControls?: boolean
  showRotationControls?: boolean
  initialPage?: number
  initialZoom?: number
  fullSize?: boolean
}

export const UploadPdfViewer = ({
  fileUrl,
  showZoomControls = true,
  showRotationControls = true,
  initialPage = 1,
  initialZoom = 100,
  fullSize: fillViewport = false,
}: Props) => {
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState(initialPage)
  const [zoom, setZoom] = useState(() => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initialZoom / 100)))
  const [rotation, setRotation] = useState(0)
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

  const effectiveZoom = showZoomControls ? zoom : 1
  const effectiveRotation = showRotationControls ? rotation : 0

  // Base width handed to <Page> before the zoom factor is applied.
  let baseWidth = containerWidth
  if (fillViewport && containerWidth && containerHeight && pageAspectRatio) {
    // Account for 90°/270° rotation swapping the page's width and height.
    const rotated = effectiveRotation % 180 !== 0
    const aspect = rotated ? 1 / pageAspectRatio : pageAspectRatio
    // Width that would make the page exactly as tall as the container.
    const widthConstrainedByHeight = containerHeight * aspect
    // Fit within both dimensions so the whole page is visible on initial render.
    baseWidth = Math.min(containerWidth, widthConstrainedByHeight)
  }

  return (
    <div className="h-full space-y-2">
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

        {showZoomControls && (
          <>
            <span className="mx-2 text-gray-300">|</span>

            <button
              type="button"
              className={linkStyles}
              disabled={zoom <= MIN_ZOOM}
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            >
              <MagnifyingGlassMinusIcon className="size-4" />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className={linkStyles}
              disabled={zoom >= MAX_ZOOM}
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            >
              <MagnifyingGlassPlusIcon className="size-4" />
            </button>
          </>
        )}

        {showRotationControls && (
          <>
            <span className="mx-2 text-gray-300">|</span>

            <button
              type="button"
              className={linkStyles}
              onClick={() => setRotation((r) => (r + 90) % 360)}
            >
              <ArrowPathIcon className="size-4" />
            </button>
          </>
        )}
      </nav>

      <div
        ref={containerRef}
        className={clsx(
          "flex h-full w-full items-center justify-center overflow-auto rounded border border-blue-500 bg-gray-50",
        )}
      >
        <Document
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
              onLoadSuccess={(page) => setPageAspectRatio(page.originalWidth / page.originalHeight)}
            />
          )}
        </Document>
      </div>
    </div>
  )
}
