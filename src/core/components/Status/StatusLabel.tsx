import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

type Props = {
  icon: "XMARK" | "CLOCK" | "CHECKMARK" | "DOCUMENT"
  label: string
  colorClass: string
}

const statusIcon = {
  XMARK: <XMarkIcon className="h-4 w-4" />,
  DOCUMENT: <DocumentTextIcon className="h-4 w-4" />,
  CLOCK: <ClockIcon className="h-4 w-4" />,
  CHECKMARK: <CheckIcon className="h-4 w-4" />,
}

export const StatusLabel: React.FC<Props> = ({ icon, label, colorClass }) => {
  return (
    <div
      className={clsx(
        colorClass,
        "flex w-[200px] flex-shrink-0 items-center gap-4 whitespace-nowrap rounded-full px-5 py-2",
      )}
    >
      {statusIcon[icon]} <div>{label}</div>
    </div>
  )
}
