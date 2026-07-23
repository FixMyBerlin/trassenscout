import { twJoin, twMerge } from "tailwind-merge"
import {
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableWrapperClassName,
} from "@/src/components/admin/adminListClasses"
import { AdminTableExternalLink } from "@/src/components/admin/AdminTableActions"
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

const headerCellClassName = twMerge(
  adminTableHeaderClassName,
  "py-2.5 text-left text-sm font-medium whitespace-nowrap text-gray-500",
)

const bodyCellClassName = twMerge(
  adminTableCellClassName,
  "py-2.5 text-left align-middle text-sm text-gray-900",
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
      <h2 id="membership-user-invites-heading" className="text-sm font-semibold text-gray-900">
        Einladungen
      </h2>

      {invites.length === 0 ? (
        <p className="text-sm text-gray-500">Keine ausstehenden oder aktiven Einladungen.</p>
      ) : (
        <div className={adminTableWrapperClassName}>
          <table className={twJoin(adminTableClassName, "table-fixed")}>
            <colgroup>
              <col className="w-32" />
              <col className="w-36" />
              <col className="w-48" />
              <col className="w-44" />
              <col className="w-32" />
            </colgroup>
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th scope="col" className={headerCellClassName}>
                  Projekt
                </th>
                <th scope="col" className={headerCellClassName}>
                  Status
                </th>
                <th scope="col" className={headerCellClassName}>
                  Rechte
                </th>
                <th scope="col" className={headerCellClassName}>
                  Aktualisiert
                </th>
                <th scope="col" className={twMerge(headerCellClassName, "text-right")}>
                  <span className="sr-only">Zur Projekt-Einladungsseite</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invites.map((invite) => (
                <tr key={invite.id}>
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
        </div>
      )}
    </section>
  )
}
