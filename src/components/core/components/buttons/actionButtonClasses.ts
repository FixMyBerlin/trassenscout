import { clsx } from "clsx"
import { adminIconButtonClassName, compactButtonBase } from "./buttonStyles"

/** Shared compact action control base — matches {@link selectLinkStyle} button links. */
export const actionButtonBase = compactButtonBase

/** Icon-only neutral secondary action (admin tables, row controls, etc.). */
export const actionIconButtonClassName = clsx(
  actionButtonBase,
  "size-8 shrink-0 p-0 text-gray-600 inset-ring inset-ring-gray-300 hover:bg-gray-50 hover:text-gray-900",
)

/** Icon-only admin action — pink styling for super-admin debug controls. */
export const actionAdminIconButtonClassName = adminIconButtonClassName
