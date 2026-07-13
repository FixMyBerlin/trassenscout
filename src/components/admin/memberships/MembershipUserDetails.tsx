import type { ReactNode } from "react"
import {
  adminTableClassName,
  adminTableWrapperClassName,
} from "@/src/components/admin/adminListClasses"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatTableDateTime } from "@/src/components/core/utils/formatTableDateTime"
import { UserRoleEnum } from "@/src/prisma/generated/browser"

type UserDetails = {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  institution: string | null
  role: string
  emailVerified: boolean
  createdAt: Date | string
}

type Props = {
  user: UserDetails
}

const userRoleLabels: Record<UserRoleEnum, string> = {
  [UserRoleEnum.ADMIN]: "Trassenscout-Admin",
  [UserRoleEnum.USER]: "Nutzer",
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <tr>
      <th
        scope="row"
        className="w-40 max-w-40 py-1.5 pr-3 pl-4 text-left align-top text-sm font-medium whitespace-nowrap text-gray-500"
      >
        {label}
      </th>
      <td className="py-1.5 pr-4 pl-0 text-left align-top text-sm text-gray-900">{value}</td>
    </tr>
  )
}

function displayValue(value: string | null | undefined) {
  return value?.trim() ? value : "—"
}

function formatCreatedAt(value: Date | string) {
  const formatted = formatTableDateTime(value)
  return formatted ? `${formatted.date}, ${formatted.time}` : "—"
}

export function MembershipUserDetails({ user }: Props) {
  const fullName = getFullname(user)
  const roleLabel =
    user.role in userRoleLabels ? userRoleLabels[user.role as UserRoleEnum] : user.role

  return (
    <section aria-labelledby="membership-user-details-heading">
      <h2 id="membership-user-details-heading" className="sr-only">
        Nutzerdetails
      </h2>
      <div className={adminTableWrapperClassName}>
        <table className={adminTableClassName}>
          <tbody className="divide-y divide-gray-200 bg-white">
            <DetailRow label="Name" value={displayValue(fullName)} />
            <DetailRow label="E-Mail" value={user.email} />
            <DetailRow label="Telefon" value={displayValue(user.phone)} />
            <DetailRow label="Organisation" value={displayValue(user.institution)} />
            <DetailRow label="Rolle" value={roleLabel} />
            <DetailRow label="E-Mail verifiziert" value={user.emailVerified ? "Ja" : "Nein"} />
            <DetailRow label="Registriert am" value={formatCreatedAt(user.createdAt)} />
            <DetailRow label="Nutzer-ID" value={user.id} />
          </tbody>
        </table>
      </div>
    </section>
  )
}
