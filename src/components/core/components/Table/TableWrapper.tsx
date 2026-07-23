import { ReactNode } from "react"
import { twJoin, twMerge } from "tailwind-merge"

type Props = {
  className?: string
  children: ReactNode
  /** Omit top border when flush under PageHeader (header owns the separator). */
  flushTop?: boolean
}

const tableChromeClassName = twJoin(
  "not-prose overflow-hidden border border-gray-200",
  "[&_table]:min-w-full [&_table]:divide-y [&_table]:divide-gray-200",
  "[&_thead]:bg-white",
  "[&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-gray-500",
  "[&_tbody]:divide-y [&_tbody]:divide-gray-200 [&_tbody]:bg-white",
)

export const TableWrapper = ({ className, children, flushTop = false }: Props) => {
  return (
    <div className={twMerge("w-full overflow-x-auto", className)}>
      <div className={twMerge(tableChromeClassName, flushTop && "border-t-0")}>{children}</div>
    </div>
  )
}
