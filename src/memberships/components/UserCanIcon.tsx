import { MembershipRole } from "@/src/authorization/types"
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { roleTranslation } from "./roleTranslation.const"

type Props = { role: MembershipRole; isAdmin: boolean; className?: string }

export const UserCanIcon = ({ role, isAdmin, className }: Props) => {
  const title = isAdmin ? "Platform-Admin" : roleTranslation[role]
  const classes = clsx(className || "h-4 w-4", isAdmin ? "text-purple-400" : "")

  switch (role) {
    case "VIEWER":
      return <LockClosedIcon title={title} className={classes} />
    case "EDITOR":
      return <LockOpenIcon title={title} className={classes} />
  }
}
