import { twJoin } from "tailwind-merge"
import { linkStyles } from "@/src/components/core/components/links/styles"

export const ProjectRecordTagsList = ({
  tags,
  isInteractive = false,
  onTagClick,
}: {
  tags: { id: number; title: string }[]
  isInteractive?: boolean
  onTagClick?: (tag: string) => void
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
            className={twJoin(
              linkStyles,
              "inline-block cursor-pointer rounded-sm bg-gray-100 px-2 py-1 text-xs",
            )}
            onClick={(e) => handleTagClick(e, tag.title)}
            type="button"
          >
            #{tag.title}
          </button>
        ) : (
          <span key={tag.id} className="inline-block rounded-sm bg-gray-100 px-2 py-1 text-xs">
            #{tag.title}
          </span>
        ),
      )}
    </div>
  )
}
