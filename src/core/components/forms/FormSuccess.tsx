import { CheckIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { proseClasses } from "../text"

type Props = {
  message: string
  show: boolean
  className?: string
}

export const FormSuccess = ({ message, show, className }: Props) => {
  return (
    <div
      role={show ? "alert" : undefined}
      className={clsx(
        proseClasses,
        "flex items-center gap-2 rounded-sm p-4",
        show ? "bg-green-50 text-green-800" : "invisible",
        className,
      )}
    >
      <CheckIcon className={clsx("h-4 w-4", show ? "text-green-600" : "invisible")} />
      <span className="font-mono text-sm leading-tight">{show ? message : ""}</span>
    </div>
  )
}
