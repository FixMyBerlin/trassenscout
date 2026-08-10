import { twJoin } from "tailwind-merge"
import type { MembershipAccess } from "@/src/components/admin/memberships/membershipAccessUtils"
import {
  membershipRegionCellClassName,
  membershipTableCellYClassName,
} from "@/src/components/admin/memberships/membershipRegionClasses"
import { membershipRegionDisplay } from "@/src/components/admin/memberships/membershipRegionDisplay"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"

type Props = {
  access: MembershipAccess
}

export function MembershipRegionCell({ access }: Props) {
  const { label, Icon, iconClassName } = membershipRegionDisplay(access)

  return (
    <td className={membershipRegionCellClassName(access)}>
      <Tooltip content={label}>
        <span
          className={twJoin(
            "flex items-center justify-center",
            membershipTableCellYClassName,
            iconClassName,
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </Tooltip>
    </td>
  )
}
