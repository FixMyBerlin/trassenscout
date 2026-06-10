import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
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

type AdminTableFeatureSwitchProps = {
  enabled: boolean
  onToggle: () => void
  label: string
  icon: React.ReactNode
  disabled?: boolean
}

export const AdminTableFeatureSwitch = ({
  enabled,
  onToggle,
  label,
  icon,
  disabled,
}: AdminTableFeatureSwitchProps) => (
  <Tooltip content={label}>
    <span className="inline-flex">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
        className={clsx(
          "relative inline-flex w-11 shrink-0 rounded-full p-0.5 ring-1 ring-gray-900/5 outline-offset-2 transition-colors duration-200 ease-in-out ring-inset focus-visible:outline-2 focus-visible:outline-blue-600",
          enabled ? "bg-blue-600" : "bg-gray-200",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <span
          className={clsx(
            "relative size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out",
            enabled && "translate-x-5",
          )}
        >
          <span
            aria-hidden
            className={clsx(
              "absolute inset-0 flex size-full items-center justify-center transition-colors duration-200 ease-in-out [&_svg]:size-3",
              enabled ? "text-blue-600" : "text-gray-400",
            )}
          >
            {icon}
          </span>
        </span>
      </button>
    </span>
  </Tooltip>
)
