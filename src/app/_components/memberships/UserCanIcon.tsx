import { MembershipRole } from "@/src/authorization/types"
import { Tooltip } from "@/src/core/components/Tooltip/Tooltip"
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { roleTranslation } from "./roleTranslation.const"

type Props = { role: MembershipRole; isAdmin: boolean; className?: string }

export const UserCanIcon = ({ role, isAdmin, className }: Props) => {
  const title = isAdmin ? "Trassenscout-Admin ('Superadmin')" : roleTranslation[role]
  const classes = clsx(className || "h-4 w-4", isAdmin ? "text-purple-400" : "")

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
