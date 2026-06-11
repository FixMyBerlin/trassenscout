import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"

const adminBoxIconButtonClassName = clsx(
  "inline-flex size-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-md font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
  "bg-purple-50 p-0 text-purple-700 inset-ring inset-ring-purple-300/80 hover:bg-purple-100 hover:text-purple-900 focus-visible:outline-purple-500 active:bg-purple-200/80",
)

type AdminBoxIconButtonProps = {
  label: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export const AdminBoxIconButton = ({
  label,
  onClick,
  children,
  className,
}: AdminBoxIconButtonProps) => (
  <Tooltip content={label}>
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={twMerge(adminBoxIconButtonClassName, className)}
    >
      {children}
    </button>
  </Tooltip>
)
