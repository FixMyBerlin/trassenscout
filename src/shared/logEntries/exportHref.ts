export function logEntriesExportHref(filter: { projectSlug?: string; months?: number }) {
  const params = new URLSearchParams()
  if (filter.projectSlug) params.set("projectSlug", filter.projectSlug)
  if (filter.months) params.set("months", String(filter.months))
  const query = params.toString()

  return `/api/log-entries/export${query ? `?${query}` : ""}`
}
