import { twJoin } from "tailwind-merge"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
}

export const ProjectIcon = ({ label, className, ...props }: Props) => (
  <div
    className={twJoin(
      "flex h-9 w-auto flex-none items-center justify-center rounded-lg",
      "border-2 border-yellow-500 bg-yellow-500 px-1.5",
      "font-sans text-xl leading-none font-semibold text-yellow-950",
      className,
    )}
    {...props}
  >
    {label}
  </div>
)
