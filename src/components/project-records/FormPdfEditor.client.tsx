import type { PDFDocumentProxy } from "pdfjs-dist"
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Spinner } from "@/src/components/core/components/Spinner"
import { getPdfWorkerSrc } from "@/src/components/core/pdf/getPdfWorkerSrc"
import { FORM_PDF_FONT_SIZE } from "@/src/shared/formTemplates/pdfLayout"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "./formPdfEditor.css"

pdfjs.GlobalWorkerOptions.workerSrc = getPdfWorkerSrc()

type Props = {
  data: Uint8Array
  onDocumentReady: (document: PDFDocumentProxy | null) => void
}

export const FormPdfEditor = ({ data, onDocumentReady }: Props) => {
  const [numPages, setNumPages] = useState(0)
  const [width, setWidth] = useState<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Copied because react-pdf detaches the buffer. `useMemo` rather than trusting the compiler:
  // a new identity reloads <Document> and wipes what the user typed.
  const file = useMemo(() => ({ data: data.slice() }), [data])

  return (
    <div
      ref={containerRef}
      className="formPdfEditor max-h-[60vh] overflow-y-auto rounded-md bg-gray-100 p-2"
      style={{ "--form-pdf-font-size": `${FORM_PDF_FONT_SIZE}px` } as CSSProperties}
    >
      <Document
        file={file}
        loading={<Spinner />}
        error={<p className="p-4 text-sm text-red-700">Das PDF konnte nicht geladen werden.</p>}
        onLoadSuccess={(document) => {
          setNumPages(document.numPages)
          onDocumentReady(document)
        }}
        onLoadError={() => onDocumentReady(null)}
      >
        {Array.from({ length: numPages }, (_, index) => (
          <Page
            key={index}
            pageNumber={index + 1}
            width={width ? width - 16 : undefined}
            renderAnnotationLayer
            renderForms
            renderTextLayer={false}
            className="mb-3 bg-white shadow-sm"
          />
        ))}
      </Document>
    </div>
  )
}
