import { clsx } from "clsx"
import type { MembershipAccess } from "@/src/components/admin/memberships/membershipAccessUtils"
import {
  membershipRegionCellClassName,
  membershipTableCellYClassName,
} from "@/src/components/admin/memberships/membershipRegionClasses"
import { membershipRegionDisplay } from "@/src/components/admin/memberships/membershipRegionDisplay"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"

type Props = {
  access: MembershipAccess
  isAdmin: boolean
}

export function MembershipRegionCell({ access, isAdmin }: Props) {
  const { label, Icon, iconClassName } = membershipRegionDisplay(access, isAdmin)

  return (
    <td className={membershipRegionCellClassName(access, isAdmin)}>
      <Tooltip content={label}>
        <span
          className={clsx(
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
