/**
 * Shared layout/sizing for pill-style badges — no colors.
 * Add `border border-*`, `bg-*`, `text-*` (and icon colors) in each component.
 */
export const pillShellClassName = "inline-flex items-center rounded-full px-2 py-0.5 font-medium"

/** Same shell with gap between leading icon and label. */
export const pillShellWithGapClassName =
  "inline-flex items-center gap-1 rounded-full px-3 py-0.5 font-medium"

/** Dense pills (tables, compact lists). */
export const pillShellSmClassName = `${pillShellClassName} text-xs`
