import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  className?: string
  /** When true, the table chrome includes a top border (default omits it for stacked page layouts). */
  withTopBorder?: boolean
  /**
   * When false, uses overflow-hidden and tabIndex={-1} so the wrapper is not a Tab stop
   * (map-mode sr-only lists pass scrollable={interactive} with interactive={false}).
   * Default true keeps list-mode horizontal scroll (overflow-x-auto).
   */
  scrollable?: boolean
  children: ReactNode
}

const tableChromeClassName = "not-prose overflow-hidden border border-gray-200"

export const TableWrapper = ({
  className,
  withTopBorder = false,
  scrollable = true,
  children,
}: Props) => {
  return (
    <div
      className={twMerge("w-full", scrollable ? "overflow-x-auto" : "overflow-hidden", className)}
      tabIndex={scrollable ? undefined : -1}
    >
      <div className={twMerge(tableChromeClassName, !withTopBorder && "border-t-0")}>
        {children}
      </div>
    </div>
  )
}
