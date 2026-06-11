import { clsx } from "clsx"
import {
  membershipUserColumnClassName,
  membershipUserLineClassName,
} from "@/src/components/admin/memberships/membershipRegionClasses"
import { Link } from "@/src/components/core/components/links/Link"
import { getFullname } from "@/src/components/core/users/getFullname"

type UserLike = {
  id?: number
  firstName: string | null
  lastName: string | null
  email: string
  role: string
}

type Props = {
  user: UserLike
  membershipDetailUserId?: number
}

function getUserTooltipContent(user: UserLike) {
  const fullName = getFullname(user) || "(kein Name)"
  const parts = [fullName, user.email]
  if (user.role === "ADMIN") {
    parts.push("(Admin)")
  }
  return parts.join(" · ")
}

export function MembershipUserCell({ user, membershipDetailUserId }: Props) {
  const fullName = getFullname(user) || "(kein Name)"
  const secondaryLine = user.role === "ADMIN" ? `${user.email} · Admin` : user.email

  const content = (
    <div className="flex w-full min-w-0 flex-col gap-0 leading-tight">
      <strong className={clsx(membershipUserLineClassName, "text-sm font-semibold")}>
        {fullName}
      </strong>
      <span className={clsx(membershipUserLineClassName, "text-xs text-gray-500")}>
        {secondaryLine}
      </span>
    </div>
  )

  return (
    <td title={getUserTooltipContent(user)} className={membershipUserColumnClassName}>
      {membershipDetailUserId ? (
        <Link
          to="/admin/memberships/$userId"
          params={{ userId: String(membershipDetailUserId) }}
          className="block min-w-0 text-inherit no-underline hover:text-inherit"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </td>
  )
}
