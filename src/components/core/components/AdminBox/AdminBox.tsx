import { twMerge } from "tailwind-merge"
import {
  adminBoxAccentClassName,
  adminBoxLabelClassName,
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
        "relative flex flex-col rounded-md border text-xs leading-snug",
        surface,
        accent,
        "prose-xs max-w-none",
        compact ? "my-2 gap-1.5 p-2" : "my-4 gap-2 p-3",
        className,
      )}
    >
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  )
}
