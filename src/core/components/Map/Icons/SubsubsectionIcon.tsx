import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { twJoin } from "tailwind-merge"
import { shortTitle } from "../../text"
import { subsubsectionColors } from "../colors/subsubsectionColors"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  slug: string
}

export const SubsubsectionIcon = ({ slug, ...props }: Props) => {
  const label = shortTitle(slug)
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const isActive = slug === subsubsectionSlug

  return (
    <div
      className={twJoin(
        "flex h-9 w-auto flex-none items-center justify-center rounded-lg border-2 bg-white px-1.5 font-sans text-xl leading-none font-semibold",
        isActive
          ? `${subsubsectionColors.currentBorderClass} ${subsubsectionColors.currentTextClass}`
          : "border-gray-900 text-gray-900",
      )}
      {...props}
    >
      {label}
    </div>
  )
}

export const SubsubsectionMapIcon = ({ slug, ...props }: Props) => {
  const label = shortTitle(slug)
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const isActive = slug === subsubsectionSlug

  return (
    <div
      className={twJoin(
        "flex h-5 w-auto flex-none items-center justify-center rounded-md border-2 bg-white px-1.5 font-sans text-xs leading-none font-semibold",
        isActive
          ? `${subsubsectionColors.currentBorderClass} ${subsubsectionColors.currentTextClass}`
          : "border-gray-900 text-gray-900",
      )}
      {...props}
    >
      {label}
    </div>
  )
}
