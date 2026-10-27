import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { type TagColor, tagPillColorClassName } from "@/src/components/tags/tagColors"

type TagPill = { id: number; title: string; color?: TagColor | null; description?: string | null }

const pillClassName = (tag: TagPill) =>
  twJoin(
    "inline-block rounded-sm border px-2 py-1 text-left text-xs",
    tagPillColorClassName(tag.color),
  )

// Coloured tags darken their text on hover like links do; neutral ones stay link-blue.
const clickablePillClassName = (tag: TagPill) =>
  twJoin(pillClassName(tag), "cursor-pointer", tag.color ? "hover:text-gray-900" : linkStyles)

export const ProjectRecordTagsList = ({
  tags,
  isInteractive = false,
  onTagClick,
  getTagHref,
}: {
  tags: TagPill[]
  isInteractive?: boolean
  onTagClick?: (tag: string) => void
  getTagHref?: (tag: string) => string
}) => {
  if (tags.length === 0) return
  const sortedTags = [...tags].sort((a, b) => a.title.localeCompare(b.title, "de"))

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation()
    e.preventDefault()
    onTagClick?.(tag)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sortedTags.map((tag) =>
        isInteractive ? (
          <button
            key={tag.id}
            className={clickablePillClassName(tag)}
            title={tag.description ?? undefined}
            onClick={(e) => handleTagClick(e, tag.title)}
            type="button"
          >
            #{tag.title}
          </button>
        ) : getTagHref ? (
          <Link
            key={tag.id}
            to={getTagHref(tag.title)}
            classNameOverwrites={clickablePillClassName(tag)}
            title={tag.description ?? undefined}
          >
            #{tag.title}
          </Link>
        ) : (
          <span key={tag.id} className={pillClassName(tag)} title={tag.description ?? undefined}>
            #{tag.title}
          </span>
        ),
      )}
    </div>
  )
}
