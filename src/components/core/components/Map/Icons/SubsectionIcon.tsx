import { clsx } from "clsx"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
}

export const SubsectionIcon = ({ label, ...props }: Props) => (
  <div
    className={clsx(
      "flex h-9 w-auto flex-none items-center justify-center rounded-lg",
      "border-2 border-gray-900 bg-gray-900 px-1.5",
      "font-sans text-xl leading-none font-semibold text-white",
    )}
    {...props}
  >
    {label}
  </div>
)

export const SubsectionMapIcon = ({ label, ...props }: Props) => (
  <div
    className={clsx(
      "flex h-5 w-auto flex-none items-center justify-center rounded-md",
      "border-2 border-gray-900 bg-gray-900 px-1.5",
      "font-sans text-xs leading-none font-semibold text-white",
    )}
    {...props}
  >
    {label}
  </div>
)
