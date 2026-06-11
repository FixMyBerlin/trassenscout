import { LockClosedIcon, LockOpenIcon, XMarkIcon } from "@heroicons/react/20/solid"
import {
  MEMBERSHIP_ACCESS_LEVELS,
  type MembershipAccess,
  type MembershipAccessLevel,
} from "@/src/components/admin/memberships/membershipAccessUtils"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { MembershipRoleEnum } from "@/src/prisma/generated/client"

type MembershipRegionIcon = typeof XMarkIcon

export type MembershipRegionDisplay = {
  label: string
  Icon: MembershipRegionIcon
  iconClassName: string
  backgroundClassName: string
}

export type MembershipRegionToggleOption = MembershipRegionDisplay & {
  value: MembershipAccessLevel
}

export function membershipRegionDisplay(
  access: MembershipAccess,
  isAdmin = false,
): MembershipRegionDisplay {
  if (isAdmin) {
    return {
      label: "Trassenscout-Admin",
      Icon: LockOpenIcon,
      iconClassName: "text-purple-600",
      backgroundClassName: "bg-purple-200 group-hover:bg-purple-300",
    }
  }

  switch (access) {
    case null:
      return {
        label: "Kein Zugriff",
        Icon: XMarkIcon,
        iconClassName: "text-gray-400",
        backgroundClassName: "bg-gray-200 group-hover:bg-gray-300",
      }
    case MembershipRoleEnum.VIEWER:
      return {
        label: roleTranslation.VIEWER,
        Icon: LockClosedIcon,
        iconClassName: "text-sky-700",
        backgroundClassName: "bg-sky-200 group-hover:bg-sky-300",
      }
    case MembershipRoleEnum.EDITOR:
      return {
        label: roleTranslation.EDITOR,
        Icon: LockOpenIcon,
        iconClassName: "text-teal-700",
        backgroundClassName: "bg-teal-200 group-hover:bg-teal-300",
      }
    default: {
      const _exhaustive: never = access
      return _exhaustive
    }
  }
}

export const membershipRegionToggleOptions: readonly MembershipRegionToggleOption[] =
  MEMBERSHIP_ACCESS_LEVELS.map((value) => ({
    value,
    ...membershipRegionDisplay(value, false),
  }))
