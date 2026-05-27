"use client"

import { linkStyles } from "@/src/core/components/links"
import {
  ArrowPathIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Tell PDF.js where to load its Web Worker from (required; react-pdf’s default path 404s in Next.js) — see react-pdf README “Configure PDF.js worker”.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.1

type Props = {
  fileUrl: string
  showZoomControls?: boolean
  showRotationControls?: boolean
  width?: number
  initialPage?: number
  initialZoom?: number
}

export const UploadPdfViewer = ({
  fileUrl,
  showZoomControls = true,
  showRotationControls = true,
  width,
  initialPage = 1,
  initialZoom = 100,
}: Props) => {
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState(initialPage)
  const [zoom, setZoom] = useState(() => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initialZoom / 100)))
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>()

  useEffect(() => {
    if (width !== undefined) return
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  const effectiveWidth = width ?? containerWidth
  const effectiveZoom = showZoomControls ? zoom : 1
  const effectiveRotation = showRotationControls ? rotation : 0

  return (
    <div className="space-y-2">
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
        className="flex justify-center overflow-auto rounded border border-gray-200 bg-gray-50"
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p className="p-4 text-sm text-gray-500">PDF wird geladen …</p>}
          error={<p className="p-4 text-sm text-red-600">PDF konnte nicht geladen werden.</p>}
          noData={<p className="p-4 text-sm text-gray-500">Keine PDF-Datei.</p>}
        >
          {effectiveWidth !== undefined && (
            <Page
              pageNumber={pageNumber}
              width={effectiveWidth}
              scale={effectiveZoom}
              rotate={effectiveRotation}
            />
          )}
        </Document>
      </div>
    </div>
  )
}
