import { twJoin } from "tailwind-merge"
import { shortTitle } from "../../text/titles"

type Props = {
  slug: string
  title?: string
  highlighted: boolean
}

export const TitleLabel = ({ slug, title, highlighted }: Props) => {
  return (
    <div className="p-1.5">
      <div>{shortTitle(slug)}</div>
      {title && (
        <div
          className={twJoin(
            "mt-1 line-clamp-2 w-max max-w-52 text-xs leading-4 wrap-break-word whitespace-normal transition-colors",
            highlighted ? "text-gray-700" : "text-gray-500",
          )}
        >
          {title}
        </div>
      )}
    </div>
  )
}
