import { clsx } from "clsx"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
}

export const ProjectIcon = ({ label, ...props }: Props) => (
  <div
    className={clsx(
      "flex h-9 w-auto flex-none items-center justify-center rounded-lg",
      "border-2 border-yellow-500 bg-yellow-500 px-1.5",
      "font-sans text-xl leading-none font-semibold text-yellow-950",
    )}
    {...props}
  >
    {label}
  </div>
)

export const ProjectMapIcon = ({ label, ...props }: Props) => (
  <div
    className={clsx(
      "flex h-5 w-auto flex-none items-center justify-center rounded-md",
      "border-2 border-yellow-500 bg-yellow-500 px-1.5",
      "font-sans text-xs leading-none font-semibold text-yellow-950",
    )}
    {...props}
  >
    {label}
  </div>
)
