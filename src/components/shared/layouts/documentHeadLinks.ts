const OVERRIDABLE_ICON_RELS = new Set(["icon", "apple-touch-icon"])

type IconLink = { rel?: string; href?: string }

export type IconLinkMatch = {
  links?: ReadonlyArray<IconLink | undefined>
}

type HeadTag = {
  tag: string
  attrs?: { rel?: unknown; href?: unknown }
}

/**
 * TanStack Router concatenates `head.links` from every match. A child
 * `rel="icon"` is added beside the root favicon, and browsers keep the first
 * one. When a deeper match defines `icon` or `apple-touch-icon`, keep only
 * that match's links for the same rel.
 */
export function preferDeepestIconLinks<T extends HeadTag>(
  tags: T[],
  matches: IconLinkMatch[],
): T[] {
  const winningHrefsByRel = new Map<string, Set<string>>()

  for (const match of matches) {
    const hrefsByRel = new Map<string, Set<string>>()
    for (const link of match.links ?? []) {
      if (!link?.rel || !link.href || !OVERRIDABLE_ICON_RELS.has(link.rel)) continue
      const hrefs = hrefsByRel.get(link.rel) ?? new Set<string>()
      hrefs.add(link.href)
      hrefsByRel.set(link.rel, hrefs)
    }
    for (const [rel, hrefs] of hrefsByRel) {
      winningHrefsByRel.set(rel, hrefs)
    }
  }

  if (winningHrefsByRel.size === 0) return tags

  return tags.filter((tag) => {
    if (tag.tag !== "link") return true
    const rel = tag.attrs?.rel
    if (typeof rel !== "string") return true
    const winningHrefs = winningHrefsByRel.get(rel)
    if (!winningHrefs) return true
    const href = tag.attrs?.href
    return typeof href === "string" && winningHrefs.has(href)
  })
}
