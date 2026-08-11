import { twJoin } from "tailwind-merge"

type Props = {
  children: React.ReactNode
  className?: string
}

/** Groups actions in a PageHeader row `right` slot (view switch, toolbar links, …). */
export function PageHeaderRowActions({ children, className }: Props) {
  return <div className={twJoin("flex shrink-0 items-center gap-2", className)}>{children}</div>
}
