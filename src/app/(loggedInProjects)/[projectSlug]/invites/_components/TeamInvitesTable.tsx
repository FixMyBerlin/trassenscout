"use client"

import { roleTranslation } from "@/src/app/_components/memberships/roleTranslation.const"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { StatusLabel } from "@/src/core/components/Status/StatusLabel"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { LinkMail } from "@/src/core/components/links"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import { INVITE_DAYS_TO_DELETION } from "@/src/server/invites/inviteSettings.const"
import getInvites from "@/src/server/invites/queries/getInvites"
import { InviteStatusEnum } from "@prisma/client"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { endOfDay, format, formatDistanceStrict, subDays } from "date-fns"
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

type Props = {
  invites: PromiseReturnType<typeof getInvites>["invites"]
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
                    label={statusTranslations[invite.status]}
                    className={clsx(statusColors[invite.status], "inline-flex")}
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
