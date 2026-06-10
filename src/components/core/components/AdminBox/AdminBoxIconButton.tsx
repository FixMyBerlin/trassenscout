import { clsx } from "clsx"
import { actionAdminIconButtonClassName } from "@/src/components/core/components/buttons/actionButtonClasses"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"

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
      className={clsx(actionAdminIconButtonClassName, className)}
    >
      {children}
    </button>
  </Tooltip>
)
