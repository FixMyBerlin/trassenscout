import { clsx } from "clsx"

/** Flat admin panels — tinted with full border, strong top accent, rounded corners. */
export const adminBoxSurfaceClassName = {
  admin: "border-purple-200/80 bg-purple-50/80 text-purple-950/90",
  dev: "border-purple-200/80 bg-purple-50/80 text-purple-950/90",
} as const

export const adminBoxAccentClassName = {
  admin: "border-t-2 border-t-purple-700",
  dev: "border-t-2 border-t-purple-700",
} as const

const adminBoxLabelBase =
  "absolute inline-flex items-center rounded-full px-1.5 py-px text-[9px]/3 font-semibold uppercase tracking-wide ring-1 ring-inset"

export const adminBoxLabelClassName = {
  admin: clsx(adminBoxLabelBase, "-top-2 left-3 bg-purple-700 text-white ring-purple-700"),
  dev: clsx(adminBoxLabelBase, "-top-2 left-3 bg-purple-700 text-white ring-purple-700"),
  adminCompact: clsx(adminBoxLabelBase, "-top-1.5 left-2 bg-purple-700 text-white ring-purple-700"),
  devCompact: clsx(adminBoxLabelBase, "-top-1.5 left-2 bg-purple-700 text-white ring-purple-700"),
} as const
