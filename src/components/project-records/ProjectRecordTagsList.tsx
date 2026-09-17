import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"

const tagPillClassName = "inline-block rounded-sm bg-gray-100 px-2 py-1 text-xs"

export const ProjectRecordTagsList = ({
  tags,
  isInteractive = false,
  onTagClick,
  getTagHref,
}: {
  tags: { id: number; title: string }[]
  isInteractive?: boolean
  onTagClick?: (tag: string) => void
  /** Links each tag somewhere, for lists that cannot filter themselves — the dashboard's tasks. */
  getTagHref?: (tag: string) => string
}) => {
  if (tags.length === 0) return

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation()
    e.preventDefault()
    onTagClick?.(tag)
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) =>
        getTagHref ? (
          <Link
            key={tag.id}
            to={getTagHref(tag.title)}
            className={twJoin(linkStyles, tagPillClassName)}
          >
            #{tag.title}
          </Link>
        ) : isInteractive ? (
          <button
            key={tag.id}
            className={twJoin(linkStyles, "cursor-pointer", tagPillClassName)}
            onClick={(e) => handleTagClick(e, tag.title)}
            type="button"
          >
            #{tag.title}
          </button>
        ) : (
          <span key={tag.id} className={tagPillClassName}>
            #{tag.title}
          </span>
        ),
      )}
    </div>
  )
}
