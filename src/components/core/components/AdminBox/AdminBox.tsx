import { twMerge } from "tailwind-merge"
import {
  adminBoxAccentClassName,
  adminBoxClassName,
  adminBoxCompactClassName,
  adminBoxDefaultClassName,
  adminBoxLabelClassName,
  adminBoxProseClassName,
  adminBoxSurfaceClassName,
} from "./adminBoxClasses"

type Props = {
  label: "Dev" | "Admin"
  className?: string
  compact?: boolean
  children: React.ReactNode
}

export const AdminBox = ({ label, className, compact = false, children }: Props) => {
  const surface = label === "Dev" ? adminBoxSurfaceClassName.dev : adminBoxSurfaceClassName.admin
  const accent = label === "Dev" ? adminBoxAccentClassName.dev : adminBoxAccentClassName.admin
  const labelClass =
    label === "Dev"
      ? compact
        ? adminBoxLabelClassName.devCompact
        : adminBoxLabelClassName.dev
      : compact
        ? adminBoxLabelClassName.adminCompact
        : adminBoxLabelClassName.admin

  return (
    <div
      className={twMerge(
        adminBoxClassName,
        surface,
        accent,
        adminBoxProseClassName,
        compact ? adminBoxCompactClassName : adminBoxDefaultClassName,
        className,
      )}
    >
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  )
}
