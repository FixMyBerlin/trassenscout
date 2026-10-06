import { ReactNode } from "react"
import { twJoin, twMerge } from "tailwind-merge"

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
  stickyFirstColumn?: boolean
  children: ReactNode
}

const stickyFirstColumnClassName = twJoin(
  "[:where(&_tr)]:bg-inherit",
  "[&_tr>:first-child]:sticky [&_tr>:first-child]:left-0 [&_tr>:first-child]:z-[1]",
  "[&_tr>:first-child]:bg-inherit",
)

export const TableWrapper = ({
  className,
  withTopBorder = false,
  scrollable = true,
  stickyFirstColumn = true,
  children,
}: Props) => {
  return (
    <div
      className={twMerge("w-full", scrollable ? "overflow-x-auto" : "overflow-hidden", className)}
      tabIndex={scrollable ? undefined : -1}
    >
      <div
        className={twMerge(
          "not-prose w-fit min-w-full border border-gray-200",
          !withTopBorder && "border-t-0",
          scrollable && stickyFirstColumn && stickyFirstColumnClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
