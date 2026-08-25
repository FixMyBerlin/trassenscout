import type { PDFDocumentProxy } from "pdfjs-dist"

/**
 * `annotationStorage` is keyed by annotation id, so it has to be joined back to field names
 * through each page's annotations. Untouched fields fall back to the document's own value.
 */
export async function readPdfFormValues(document: PDFDocumentProxy) {
  const values: Record<string, string> = {}

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber)
    for (const annotation of await page.getAnnotations({ intent: "display" })) {
      const field = annotation as { id?: string; fieldName?: string; fieldValue?: unknown }
      if (!field.fieldName || !field.id) continue

      const stored = document.annotationStorage.getRawValue(field.id) as
        | { value?: unknown }
        | undefined
      const value = stored?.value ?? field.fieldValue

      if (typeof value === "string") values[field.fieldName] = value
    }
  }

  return values
}
