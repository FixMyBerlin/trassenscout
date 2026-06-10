import { clsx } from "clsx"
import { ReactNode } from "react"

type Props = {
  className?: string
  children: ReactNode
  bleed?: boolean
}

export const TableWrapper = ({ className, children, bleed = true }: Props) => {
  return (
    <div
      className={clsx(
        className,
        bleed ? "-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8" : "w-full overflow-x-hidden",
      )}
    >
      <div
        className={clsx(
          "min-w-0 py-2 align-middle",
          bleed ? "inline-block min-w-full md:px-6 lg:px-8" : "w-full",
        )}
      >
        <div
          className={clsx(
            "not-prose overflow-hidden shadow-sm md:rounded-lg",
            bleed ? "ring-1 ring-gray-200" : "border border-gray-200",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
