import { twMerge } from "tailwind-merge"

type Props = {
  children: React.ReactNode
  className?: string
}

export const HeadingWithAction = ({ children, className }: Props) => {
  return <div className={twMerge("flex items-center justify-between", className)}>{children}</div>
}
