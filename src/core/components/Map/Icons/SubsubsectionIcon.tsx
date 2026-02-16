import { twJoin } from "tailwind-merge"
import { shortTitle } from "../../text"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  slug: string
}

const defaultIconClass =
  "flex flex-none items-center justify-center border-2 border-gray-900 bg-white font-sans font-semibold leading-none text-gray-900"

export const SubsubsectionIcon = ({ slug, ...props }: Props) => {
  const label = shortTitle(slug)
  return (
    <div className={twJoin(defaultIconClass, "h-9 w-auto rounded-lg px-1.5 text-xl")} {...props}>
      {label}
    </div>
  )
}

export const SubsubsectionMapIcon = ({ slug, ...props }: Props) => {
  const label = shortTitle(slug)
  return (
    <div className={twJoin(defaultIconClass, "h-5 w-auto rounded-md px-1.5 text-xs")} {...props}>
      {label}
    </div>
  )
}
