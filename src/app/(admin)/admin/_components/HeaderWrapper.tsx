import { clsx } from "clsx"

export const HeaderWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <header className={clsx("my-10 flex justify-between", className)}>{children}</header>
}
