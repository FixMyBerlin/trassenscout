export function buildSubsectionUrl(origin: string, projectSlug: string, subsectionSlug: string) {
  return new URL(`/${projectSlug}/abschnitte/${subsectionSlug}`, origin).href
}

export function buildSubsectionNewUrl(origin: string, projectSlug: string, slug: string) {
  const url = new URL(`/${projectSlug}/abschnitte/new`, origin)
  url.searchParams.set("mcpDraft", "true")
  url.searchParams.set("slug", slug)
  return url.href
}
