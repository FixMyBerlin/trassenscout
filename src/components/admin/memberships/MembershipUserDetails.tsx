import type { ReactNode } from "react"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
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
    <tr className={tableRowClassName}>
      <th
        scope="row"
        className="py-4 pr-3 pl-4 text-left align-top text-sm font-normal whitespace-nowrap text-gray-700"
      >
        {label}
      </th>
      <td className="px-4 py-4 text-left align-top text-sm wrap-break-word text-gray-900">
        {value}
      </td>
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
    <section aria-labelledby="membership-user-details-heading" className="space-y-3">
      <h2 id="membership-user-details-heading" className="px-4 text-lg font-semibold text-gray-700">
        Nutzerdetails
      </h2>
      <TableWrapper withTopBorder>
        <table className={tableClassName}>
          <thead className="sr-only">
            <tr className={tableHeadRowClassName}>
              <th scope="col" className={tableHeadCellClassName}>
                Attribut
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Wert
              </th>
            </tr>
          </thead>
          <tbody className={tableBodyClassName}>
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
      </TableWrapper>
    </section>
  )
}
