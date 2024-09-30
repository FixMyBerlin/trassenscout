import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { StatusLabel } from "@/src/core/components/Status/StatusLabel"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { LinkMail } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/hooks"
import getInvites from "@/src/invites/queries/getInvites"
import { roleTranslation } from "@/src/memberships/components/roleTranslation.const"
import { getFullname } from "@/src/users/utils"
import { useQuery } from "@blitzjs/rpc"
import { InviteStatusEnum } from "@prisma/client"
import { clsx } from "clsx"
import { format } from "date-fns"
import { de } from "date-fns/locale"

const statusColors: Record<InviteStatusEnum, string> = {
  PENDING: "text-yellow-700 bg-yellow-100",
  ACCEPTED: "text-green-700 bg-green-100",
  EXPIRED: "text-indigo-700 bg-indigo-100",
}

export const statusTranslations: Record<InviteStatusEnum, string> = {
  PENDING: "Ausstehend",
  ACCEPTED: "Akzeptiert",
  EXPIRED: "Abgelaufen",
}

export const TeamInvitesTable = () => {
  const projectSlug = useProjectSlug()
  const [{ invites }] = useQuery(getInvites, { projectSlug })

  return (
    <>
      <TableWrapper className="mt-7">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                E-Mail
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Recht
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Einladender
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Datum
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invites.map((invite) => (
              <tr key={invite.email}>
                <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <StatusLabel
                    label={statusTranslations[invite.status]}
                    colorClass={clsx(statusColors[invite.status], "inline-flex")}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <strong>
                    <LinkMail>{invite.email}</LinkMail>
                  </strong>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {roleTranslation[invite.role]}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">{getFullname(invite.inviter)}</td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {format(new Date(invite.updatedAt), "Pp", { locale: de })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>

      <SuperAdminLogData data={invites} />
    </>
  )
}
