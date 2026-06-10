import { clsx } from "clsx"
import { ReactNode } from "react"

type Props = {
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export const ActionBar = ({ left, right, className }: Props) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-4 rounded-md bg-gray-100 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-4">{left}</div>
      {right && <div className="flex items-center gap-4">{right}</div>}
    </div>
  )
}
