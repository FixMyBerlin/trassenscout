import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  className?: string
  children: ReactNode
}

const tableChromeClassName = "not-prose overflow-hidden border border-gray-200 border-t-0"

export const TableWrapper = ({ className, children }: Props) => {
  return (
    <div className={twMerge("w-full overflow-x-auto", className)}>
      <div className={tableChromeClassName}>{children}</div>
    </div>
  )
}
