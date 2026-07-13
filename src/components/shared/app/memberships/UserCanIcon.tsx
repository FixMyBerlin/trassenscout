import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/20/solid"
import { twJoin } from "tailwind-merge"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import type { MembershipRole } from "@/src/server/authorization/types"

type Props = { role: MembershipRole; isAdmin: boolean; className?: string }

export const UserCanIcon = ({ role, isAdmin, className }: Props) => {
  const title = isAdmin ? "Trassenscout-Admin ('Superadmin')" : roleTranslation[role]
  const classes = twJoin(className || "size-4", isAdmin ? "text-purple-400" : "")

  switch (role) {
    case "VIEWER":
      return (
        <Tooltip content={title}>
          <LockClosedIcon className={classes} />
        </Tooltip>
      )
    case "EDITOR":
      return (
        <Tooltip content={title}>
          <LockOpenIcon className={classes} />
        </Tooltip>
      )
  }
}
