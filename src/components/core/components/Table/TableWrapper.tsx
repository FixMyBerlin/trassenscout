import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  className?: string
  /** When true, the table chrome includes a top border (default omits it for stacked page layouts). */
  withTopBorder?: boolean
  children: ReactNode
}

const tableChromeClassName = "not-prose overflow-hidden border border-gray-200"

export const TableWrapper = ({ className, withTopBorder = false, children }: Props) => {
  return (
    <div className={twMerge("w-full overflow-x-auto", className)}>
      <div className={twMerge(tableChromeClassName, !withTopBorder && "border-t-0")}>
        {children}
      </div>
    </div>
  )
}
