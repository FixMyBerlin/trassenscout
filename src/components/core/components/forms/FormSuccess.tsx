import { CheckIcon } from "@heroicons/react/20/solid"
import { twJoin } from "tailwind-merge"
import { proseClasses } from "@/src/components/core/components/text/prose"

type Props = {
  message: string
  show: boolean
  className?: string
}

export const FormSuccess = ({ message, show, className }: Props) => {
  return (
    <div
      role={show ? "alert" : undefined}
      className={twJoin(
        proseClasses,
        "flex items-center gap-2 rounded-sm p-4",
        show ? "bg-green-50 text-green-800" : "invisible",
        className,
      )}
    >
      <CheckIcon className={twJoin("size-4", show ? "text-green-600" : "invisible")} />
      <span className="font-mono text-sm leading-tight">{show ? message : ""}</span>
    </div>
  )
}
