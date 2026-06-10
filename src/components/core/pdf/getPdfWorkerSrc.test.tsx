import { describe, expect, test } from "vitest"
import { getPdfWorkerSrc } from "./getPdfWorkerSrc"

describe("UploadPdfViewer PDF.js worker", () => {
  test("uses Vite ?url import to resolve the pdfjs worker asset", () => {
    expect(getPdfWorkerSrc()).not.toBe("/pdf.worker.min.mjs")
    expect(getPdfWorkerSrc()).toMatch(/pdf\.worker/)
  })
})
