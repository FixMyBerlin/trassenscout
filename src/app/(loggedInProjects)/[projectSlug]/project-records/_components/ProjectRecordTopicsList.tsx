import { linkStyles } from "@/src/core/components/links"
import clsx from "clsx"

export const ProjectRecordTopicsList = ({
  topics,
  isInteractive = false,
  onTopicClick,
}: {
  topics: { id: number; title: string }[]
  isInteractive?: boolean
  onTopicClick?: (topic: string) => void
}) => {
  if (topics.length === 0) return

  // workaround with stopPropagation to Prevent disclosure toggle
  // for now we use this workaround since we propably do not use the disclosure component in the table anyway

  const handleTopicClick = (e: React.MouseEvent, topic: string) => {
    e.stopPropagation() // Prevent the disclosure button from toggling
    e.preventDefault()
    onTopicClick?.(topic)
  }

  return (
    <div className="flex flex-wrap gap-1">
      {topics.map((topic) =>
        isInteractive ? (
          <button
            key={topic.id}
            className={clsx(linkStyles, "inline-block rounded-sm bg-gray-100 px-2 py-1 text-xs")}
            onClick={(e) => handleTopicClick(e, topic.title)}
            type="button"
          >
            #{topic.title}
          </button>
        ) : (
          <span key={topic.id} className="inline-block rounded-sm bg-gray-100 px-2 py-1 text-xs">
            #{topic.title}
          </span>
        ),
      )}
    </div>
  )
}
