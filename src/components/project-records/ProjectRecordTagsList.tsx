import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"

const tagPillClassName = "inline-block rounded-sm bg-gray-100 px-2 py-1 text-left text-xs"

export const ProjectRecordTagsList = ({
  tags,
  isInteractive = false,
  onTagClick,
  getTagHref,
}: {
  tags: { id: number; title: string }[]
  isInteractive?: boolean
  onTagClick?: (tag: string) => void
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
        isInteractive ? (
          <button
            key={tag.id}
            className={twJoin(linkStyles, "cursor-pointer", tagPillClassName)}
            onClick={(e) => handleTagClick(e, tag.title)}
            type="button"
          >
            #{tag.title}
          </button>
        ) : getTagHref ? (
          <Link key={tag.id} to={getTagHref(tag.title)} className={tagPillClassName}>
            #{tag.title}
          </Link>
        ) : (
          <span key={tag.id} className={tagPillClassName}>
            #{tag.title}
          </span>
        ),
      )}
    </div>
  )
}
