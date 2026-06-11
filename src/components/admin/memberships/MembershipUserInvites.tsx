import {
  adminTableClassName,
  adminTableWrapperClassName,
} from "@/src/components/admin/adminListClasses"
import { AdminTableExternalLink } from "@/src/components/admin/AdminTableActions"
import { StatusLabel } from "@/src/components/core/components/Status/StatusLabel"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { formatTableDateTime } from "@/src/components/core/utils/formatTableDateTime"
import {
  inviteStatusClassNames,
  inviteStatusLabels,
} from "@/src/components/invites/inviteStatusDisplay"
import type { InviteStatusEnum, MembershipRoleEnum } from "@/src/prisma/generated/browser"

export type MembershipUserInvite = {
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

const headerCellClassName =
  "py-1.5 pr-3 pl-4 text-left text-sm font-medium whitespace-nowrap text-gray-500"

const bodyCellClassName = "py-1.5 pr-4 pl-0 text-left align-top text-sm text-gray-900"

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
          <table className={adminTableClassName}>
            <thead>
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
                <th scope="col" className={headerCellClassName}>
                  <span className="sr-only">Zur Projekt-Einladungsseite</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td className={bodyCellClassName}>{shortTitle(invite.project.slug)}</td>
                  <td className={bodyCellClassName}>
                    <StatusLabel
                      label={inviteStatusLabels[invite.status]}
                      className={inviteStatusClassNames[invite.status]}
                    />
                  </td>
                  <td className={bodyCellClassName}>{roleTranslation[invite.role]}</td>
                  <td className={bodyCellClassName}>{formatUpdatedAt(invite.updatedAt)}</td>
                  <td className={bodyCellClassName}>
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
