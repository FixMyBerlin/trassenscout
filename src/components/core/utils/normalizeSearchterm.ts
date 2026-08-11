export function normalizeSearchterm(searchterm: string) {
  return searchterm.trim().toLowerCase().replace(/#/g, "").trim()
}
