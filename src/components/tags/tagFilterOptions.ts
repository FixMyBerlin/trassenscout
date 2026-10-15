type FilterTag = { title: string }

const tagKey = (title: string) => title.toLocaleLowerCase("de")

function isSameTagTitle(a: string, b: string) {
  return tagKey(a) === tagKey(b)
}

/** Tag titles on the given entries, once per name regardless of case or project. */
export function getTagFilterOptions(entries: { tags: FilterTag[] }[]) {
  const titles = new Map<string, string>()
  for (const entry of entries) {
    for (const tag of entry.tags) {
      if (!titles.has(tagKey(tag.title))) titles.set(tagKey(tag.title), tag.title)
    }
  }

  return [...titles.values()].sort((a, b) => a.localeCompare(b, "de"))
}

export function getTagFilterSelection(tags: string[], value: string | undefined) {
  const selected = value && (tags.find((tag) => isSameTagTitle(tag, value)) ?? value)
  const titles = selected && !tags.includes(selected) ? [...tags, selected] : tags

  return { selected: selected || undefined, titles }
}

export function matchesTagFilter(entry: { tags: FilterTag[] }, tag: string | undefined) {
  return !tag || entry.tags.some(({ title }) => isSameTagTitle(title, tag))
}
