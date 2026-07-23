import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/20/solid"
import { twJoin } from "tailwind-merge"
import type { MembershipRole } from "@/src/server/authorization/types"

type Props = { role: MembershipRole; isAdmin: boolean; className?: string }

const membershipRoleLabels: Record<MembershipRole, string> = {
  VIEWER: "Leserechte",
  EDITOR: "Editierrechte",
}

export const UserCanIcon = ({ role, isAdmin, className }: Props) => {
  const label = isAdmin ? "Admin" : membershipRoleLabels[role]
  const iconClassName = twJoin("size-4 shrink-0", className)

  switch (role) {
    case "VIEWER":
      return (
        <span className="inline-flex items-center gap-1">
          <LockClosedIcon className={iconClassName} />
          {label}
        </span>
      )
    case "EDITOR":
      return (
        <span className="inline-flex items-center gap-1">
          <LockOpenIcon className={iconClassName} />
          {label}
        </span>
      )
  }
}
