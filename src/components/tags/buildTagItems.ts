import { type TagColor, tagPillColorClassName } from "./tagColors"

type TagLike = {
  id: number
  title: string
  archivedAt?: Date | string | null
  color?: TagColor | null
}

export function buildTagItems(tags: TagLike[], assignedIds: string[]) {
  const assignedIdSet = new Set(assignedIds.map(String))

  return tags
    .filter((tag) => !tag.archivedAt || assignedIdSet.has(String(tag.id)))
    .map((tag) => ({
      value: String(tag.id),
      label: tag.archivedAt ? `${tag.title} (archiviert)` : tag.title,
      searchText: tag.title,
      chipClassName: tagPillColorClassName(tag.color),
    }))
}
