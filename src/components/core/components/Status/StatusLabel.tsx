import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { twMerge } from "tailwind-merge"

type Props = {
  icon?: "XMARK" | "CLOCK" | "CHECKMARK" | "DOCUMENT" | undefined
  label: string
  color?: string
  className?: string
}

const statusIcon = {
  XMARK: <XMarkIcon className="size-4" />,
  DOCUMENT: <DocumentTextIcon className="size-4" />,
  CLOCK: <ClockIcon className="size-4" />,
  CHECKMARK: <CheckIcon className="size-4" />,
}

export const StatusLabel = ({ icon, label, color, className }: Props) => {
  return (
    <div
      style={{ backgroundColor: color }}
      className={twMerge(
        "inline-flex w-fit shrink-0 items-center justify-self-start gap-4 rounded-full px-5 py-2 whitespace-nowrap",
        className,
      )}
    >
      {icon && <span className="shrink-0">{statusIcon[icon]}</span>}
      <span className="truncate">{label}</span>
    </div>
  )
}
