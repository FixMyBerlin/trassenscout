import { clsx } from "clsx"
import type { MembershipAccess } from "@/src/components/admin/memberships/membershipAccessUtils"
import { membershipRegionDisplay } from "@/src/components/admin/memberships/membershipRegionDisplay"

export const membershipRegionColumnClassName = "w-10 min-w-10 max-w-10 p-0"

export const membershipRegionHeaderClassName = clsx(
  membershipRegionColumnClassName,
  "h-[130px] max-h-[130px] overflow-hidden border-l border-gray-100 py-2 text-center align-bottom text-xs font-semibold text-gray-700",
)

export const membershipRegionHeaderLabelClassName =
  "inline-block max-h-[calc(130px-1rem)] overflow-hidden text-ellipsis whitespace-nowrap [writing-mode:vertical-rl] rotate-180"

export function membershipRegionCellClassName(access: MembershipAccess, isAdmin: boolean) {
  return clsx(
    membershipRegionColumnClassName,
    "border-l border-gray-100 text-center align-middle transition-colors",
    membershipRegionDisplay(access, isAdmin).backgroundClassName,
  )
}

export const membershipRegionToggleButtonClassName =
  "relative inline-flex cursor-pointer items-center justify-center bg-white px-1.5 py-1.5 text-xs font-semibold text-gray-900 inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:cursor-not-allowed disabled:opacity-50"

export const membershipTableHeadClassName = "border-b border-gray-200 bg-gray-50"

export const membershipTableCellYClassName = "py-1.5"

export const membershipUserColumnWidthClassName = "w-28"

export const membershipUserColumnClassName = clsx(
  membershipUserColumnWidthClassName,
  "sticky left-0 z-10 max-w-28 min-w-0 overflow-hidden border-r border-gray-200 bg-white py-1 pr-1.5 pl-2 transition-colors group-hover:bg-blue-50",
)

export const membershipUserLineClassName =
  "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"

export const membershipUserHeaderClassName = clsx(
  membershipUserColumnWidthClassName,
  "sticky left-0 z-20 max-w-28 min-w-0 border-r border-gray-200 bg-gray-50 py-1.5 pr-1.5 pl-2 text-left text-sm font-semibold text-gray-700",
)
