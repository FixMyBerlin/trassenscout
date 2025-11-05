import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

type Props = {
  icon?: "XMARK" | "CLOCK" | "CHECKMARK" | "DOCUMENT" | undefined
  label: string
  color?: string
  className?: string
}

const statusIcon = {
  XMARK: <XMarkIcon className="h-4 w-4" />,
  DOCUMENT: <DocumentTextIcon className="h-4 w-4" />,
  CLOCK: <ClockIcon className="h-4 w-4" />,
  CHECKMARK: <CheckIcon className="h-4 w-4" />,
}

export const StatusLabel = ({ icon, label, color, className }: Props) => {
  return (
    <div
      style={{ backgroundColor: color }}
      className={clsx(
        className,
        "flex shrink-0 items-center gap-4 rounded-full px-5 py-2 whitespace-nowrap",
      )}
    >
      {icon && <span>{statusIcon[icon]}</span>}
      <span className="truncate"> {label}</span>
    </div>
  )
}
