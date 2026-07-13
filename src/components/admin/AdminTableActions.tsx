import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { twJoin, twMerge } from "tailwind-merge"
import { Link, isExternalHref } from "@/src/components/core/components/links/Link"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import {
  adminTableActionsClassName,
  adminTableDeleteButtonClassName,
  adminTableEditButtonClassName,
  adminTableExternalLinkClassName,
  adminTablePrimaryButtonIconClassName,
} from "./adminListClasses"

const AdminTablePrimaryButtonContent = ({
  children,
  icon,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
}) => (
  <>
    {icon ? <span className={adminTablePrimaryButtonIconClassName}>{icon}</span> : null}
    <span className="text-left leading-tight">{children}</span>
  </>
)

type AdminTableActionsProps = {
  children: React.ReactNode
  className?: string
}

export const AdminTableActions = ({ children, className }: AdminTableActionsProps) => (
  <div className={twMerge(adminTableActionsClassName, className)}>{children}</div>
)

type AdminTableExternalLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export const AdminTableExternalLink = ({
  href,
  children,
  className,
}: AdminTableExternalLinkProps) =>
  isExternalHref(href) ? (
    <Link blank href={href} classNameOverwrites={className ?? adminTableExternalLinkClassName}>
      {children}
      <ArrowTopRightOnSquareIcon className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only"> (neues Fenster)</span>
    </Link>
  ) : (
    <Link blank to={href} classNameOverwrites={className ?? adminTableExternalLinkClassName}>
      {children}
      <ArrowTopRightOnSquareIcon className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only"> (neues Fenster)</span>
    </Link>
  )

type AdminTableEditLinkProps = {
  to: string
  children?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export const AdminTableEditLink = ({
  to,
  children = "Bearbeiten",
  icon,
  className,
}: AdminTableEditLinkProps) => (
  <Link to={to} classNameOverwrites={className ?? adminTableEditButtonClassName}>
    <AdminTablePrimaryButtonContent icon={icon}>{children}</AdminTablePrimaryButtonContent>
  </Link>
)

type AdminTablePrimaryButtonProps = {
  onClick: () => void
  children: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
  type?: "button" | "submit"
}

export const AdminTablePrimaryButton = ({
  onClick,
  children,
  icon,
  disabled,
  className,
  type = "button",
}: AdminTablePrimaryButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={className ?? adminTableEditButtonClassName}
  >
    <AdminTablePrimaryButtonContent icon={icon}>{children}</AdminTablePrimaryButtonContent>
  </button>
)

type AdminTableDeleteButtonProps = {
  onClick: () => void
  label?: string
  disabled?: boolean
  className?: string
}

export const AdminTableDeleteButton = ({
  onClick,
  label = "Löschen",
  disabled,
  className,
}: AdminTableDeleteButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={className ?? adminTableDeleteButtonClassName}
  >
    <TrashIcon className="size-4" aria-hidden />
    <span className="sr-only">{label}</span>
  </button>
)

type AdminTableFeatureCheckboxProps = {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
  indeterminate?: boolean
  tooltipPlacement?: React.ComponentProps<typeof Tooltip>["placement"]
}

export const AdminTableFeatureCheckbox = ({
  checked,
  onChange,
  label,
  disabled,
  indeterminate,
  tooltipPlacement,
}: AdminTableFeatureCheckboxProps) => {
  return (
    <Tooltip content={label} placement={tooltipPlacement}>
      <span className="inline-flex">
        <input
          // `indeterminate` is only settable via the DOM; the callback ref re-runs every render
          ref={(input) => {
            if (input) input.indeterminate = Boolean(indeterminate) && !checked
          }}
          type="checkbox"
          checked={checked}
          aria-label={label}
          disabled={disabled}
          onChange={onChange}
          className={twJoin(
            "size-4 shrink-0 rounded border-gray-300 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
        />
      </span>
    </Tooltip>
  )
}
