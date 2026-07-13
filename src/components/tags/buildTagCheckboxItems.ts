type TagLike = {
  id: number
  title: string
  archivedAt?: Date | string | null
}

export function buildTagCheckboxItems(tags: TagLike[], assignedIds: string[]) {
  const assignedIdSet = new Set(assignedIds.map(String))

  return tags
    .filter((tag) => !tag.archivedAt || assignedIdSet.has(String(tag.id)))
    .map((tag) => ({
      value: String(tag.id),
      label: tag.archivedAt ? `${tag.title} (archiviert)` : tag.title,
    }))
}
