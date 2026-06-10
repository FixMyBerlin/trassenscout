/**
 * Shared layout/sizing for pill-style badges — no colors.
 * Add `border border-*`, `bg-*`, `text-*` (and icon colors) in each component.
 */
import { twMerge } from "tailwind-merge"

const pillShellBase = "inline-flex items-center rounded-full font-medium"
export const pillShellClasses = twMerge(pillShellBase, "px-3 py-1")
export const pillShellWithGapClasses = twMerge(pillShellClasses, "gap-2")
