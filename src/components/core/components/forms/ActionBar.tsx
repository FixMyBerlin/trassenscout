import { ReactNode } from "react"
import { twJoin } from "tailwind-merge"

type Props = {
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export const ActionBar = ({ left, right, className }: Props) => {
  return (
    <div
      className={twJoin(
        "flex items-center justify-between gap-4 rounded-md bg-gray-100 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-4">{left}</div>
      {right && <div className="flex items-center gap-4">{right}</div>}
    </div>
  )
}
