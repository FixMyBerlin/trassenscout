import { twJoin, twMerge } from "tailwind-merge"
import {
  adminTableBodyClassName,
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableHeadRowClassName,
  adminTableRowClassName,
} from "@/src/components/admin/adminListClasses"
import { AdminTableExternalLink } from "@/src/components/admin/AdminTableActions"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { formatTableDateTime } from "@/src/components/core/utils/formatTableDateTime"
import { pillShellClasses } from "@/src/components/core/utils/pillClassNames"
import {
  inviteStatusClassNames,
  inviteStatusLabels,
} from "@/src/components/invites/inviteStatusDisplay"
import type { InviteStatusEnum, MembershipRoleEnum } from "@/src/prisma/generated/browser"

type MembershipUserInvite = {
  id: number
  status: InviteStatusEnum
  role: MembershipRoleEnum
  updatedAt: Date | string
  project: {
    slug: string
  }
}

type Props = {
  invites: MembershipUserInvite[]
}

const bodyCellClassName = twMerge(
  adminTableCellClassName,
  "text-left align-middle text-sm text-gray-900",
)

function InviteStatusBadge({ invite }: { invite: MembershipUserInvite }) {
  return (
    <span
      className={twMerge(
        pillShellClasses,
        "min-w-24 justify-center text-sm whitespace-nowrap",
        inviteStatusClassNames[invite.status],
      )}
    >
      {inviteStatusLabels[invite.status]}
    </span>
  )
}

function formatUpdatedAt(value: Date | string) {
  const formatted = formatTableDateTime(value)
  return formatted ? `${formatted.date}, ${formatted.time}` : "—"
}

export function MembershipUserInvites({ invites }: Props) {
  return (
    <section aria-labelledby="membership-user-invites-heading" className="space-y-3">
      <h2 id="membership-user-invites-heading" className="px-4 text-lg font-semibold text-gray-700">
        Einladungen
      </h2>

      {invites.length === 0 ? (
        <p className="px-4 text-sm text-gray-600">Keine ausstehenden oder aktiven Einladungen.</p>
      ) : (
        <TableWrapper withTopBorder>
          <table className={twJoin(adminTableClassName, "table-fixed")}>
            <colgroup>
              <col className="w-32" />
              <col className="w-36" />
              <col className="w-48" />
              <col className="w-44" />
              <col className="w-32" />
            </colgroup>
            <thead>
              <tr className={adminTableHeadRowClassName}>
                <th scope="col" className={adminTableHeaderClassName}>
                  Projekt
                </th>
                <th scope="col" className={adminTableHeaderClassName}>
                  Status
                </th>
                <th scope="col" className={adminTableHeaderClassName}>
                  Rechte
                </th>
                <th scope="col" className={adminTableHeaderClassName}>
                  Aktualisiert
                </th>
                <th scope="col" className={twMerge(adminTableHeaderClassName, "text-right")}>
                  <span className="sr-only">Zur Projekt-Einladungsseite</span>
                </th>
              </tr>
            </thead>
            <tbody className={adminTableBodyClassName}>
              {invites.map((invite) => (
                <tr key={invite.id} className={adminTableRowClassName}>
                  <td className={twMerge(bodyCellClassName, "font-medium")}>
                    {shortTitle(invite.project.slug)}
                  </td>
                  <td className={bodyCellClassName}>
                    <InviteStatusBadge invite={invite} />
                  </td>
                  <td className={bodyCellClassName}>
                    <span className="block truncate">{roleTranslation[invite.role]}</span>
                  </td>
                  <td className={twMerge(bodyCellClassName, "whitespace-nowrap")}>
                    {formatUpdatedAt(invite.updatedAt)}
                  </td>
                  <td className={twMerge(bodyCellClassName, "text-right")}>
                    <AdminTableExternalLink href={`/${invite.project.slug}/invites`}>
                      Einladungen
                    </AdminTableExternalLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      )}
    </section>
  )
}
