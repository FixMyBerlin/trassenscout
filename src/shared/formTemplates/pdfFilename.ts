const sanitizeFilenamePart = (value: string) =>
  value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export function buildFormPdfFilename(input: {
  formSlug: string
  projectSlug: string
  /** Maßnahme slug, or an id for a Verhandlungsfläche. */
  context?: string | null
  date: Date
}) {
  const isoDate = [
    input.date.getFullYear(),
    String(input.date.getMonth() + 1).padStart(2, "0"),
    String(input.date.getDate()).padStart(2, "0"),
  ].join("-")

  const parts = [input.formSlug, input.projectSlug, input.context ?? "", isoDate]
    .map(sanitizeFilenamePart)
    .filter(Boolean)

  return `${parts.join("_")}.pdf`
}
