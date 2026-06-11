import { clsx } from "clsx"
import { endOfDay, format, formatDistanceStrict, subDays } from "date-fns"
import { de } from "date-fns/locale"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { StatusLabel } from "@/src/components/core/components/Status/StatusLabel"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { getFullname } from "@/src/components/core/users/getFullname"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import {
  inviteStatusClassNames,
  inviteStatusLabels,
} from "@/src/components/invites/inviteStatusDisplay"
import { INVITE_DAYS_TO_DELETION } from "@/src/server/invites/inviteSettings.const"
import type { InvitesResult } from "@/src/server/invites/types"

type Props = {
  invites: InvitesResult["invites"]
}

export const TeamInvitesTable = ({ invites }: Props) => {
  const currentDate = endOfDay(new Date())

  return (
    <>
      <TableWrapper className="mt-7">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                E-Mail
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Rechte
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Einladung von
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Datum
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Gültigkeit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invites.map((invite) => (
              <tr key={invite.email}>
                <td className="h-20 py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                  <StatusLabel
                    label={inviteStatusLabels[invite.status]}
                    className={clsx(inviteStatusClassNames[invite.status], "inline-flex")}
                  />
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  <strong>
                    <LinkMail>{invite.email}</LinkMail>
                  </strong>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {roleTranslation[invite.role]}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">{getFullname(invite.inviter)}</td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {format(new Date(invite.updatedAt), "Pp", { locale: de })}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {formatDistanceStrict(
                    subDays(currentDate, INVITE_DAYS_TO_DELETION),
                    invite.updatedAt,
                    {
                      locale: de,
                      unit: "day",
                    },
                  )}
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
