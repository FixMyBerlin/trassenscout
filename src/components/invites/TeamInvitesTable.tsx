import { endOfDay, format, formatDistanceStrict, subDays } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"
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

/**
 * Column width classes for `table-fixed` layout. Adjust percentages here only.
 */
const teamInvitesTableColWidths = {
  status: "w-[28%] @xl:w-[12%]",
  email: "min-w-0 w-[42%] @xl:w-[24%]",
  role: "w-[30%] @xl:w-[12%]",
  inviter: "hidden @xl:table-column @xl:w-[18%]",
  date: "hidden @xl:table-column @xl:w-[18%]",
  validity: "hidden @xl:table-column @xl:w-[16%]",
} as const

type Props = {
  invites: InvitesResult["invites"]
}

export const TeamInvitesTable = ({ invites }: Props) => {
  const currentDate = endOfDay(new Date())
  const spaceClasses = "px-3 py-2"

  return (
    <>
      <TableWrapper flushTop>
        <div className="@container w-full">
          <table className="min-w-full table-fixed border-collapse text-left text-sm text-gray-700">
            <colgroup>
              <col className={teamInvitesTableColWidths.status} />
              <col className={teamInvitesTableColWidths.email} />
              <col className={teamInvitesTableColWidths.role} />
              <col className={teamInvitesTableColWidths.inviter} />
              <col className={teamInvitesTableColWidths.date} />
              <col className={teamInvitesTableColWidths.validity} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                  Status
                </th>
                <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                  E-Mail
                </th>
                <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                  Rechte
                </th>
                <th
                  scope="col"
                  className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Einladung von
                </th>
                <th
                  scope="col"
                  className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Datum
                </th>
                <th
                  scope="col"
                  className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Gültigkeit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invites.map((invite) => (
                <tr key={invite.email} className="border-b border-gray-100">
                  <td className={twJoin(spaceClasses, "align-top")}>
                    <StatusLabel
                      label={inviteStatusLabels[invite.status]}
                      className={twJoin(inviteStatusClassNames[invite.status], "inline-flex")}
                    />
                  </td>
                  <td className={twJoin(spaceClasses, "min-w-0 align-top")}>
                    <LinkMail>{invite.email}</LinkMail>
                  </td>
                  <td className={twJoin(spaceClasses, "align-top whitespace-nowrap")}>
                    {roleTranslation[invite.role]}
                  </td>
                  <td className={twJoin("hidden align-top @xl:table-cell", spaceClasses)}>
                    {getFullname(invite.inviter)}
                  </td>
                  <td className={twJoin("hidden align-top @xl:table-cell", spaceClasses)}>
                    {format(new Date(invite.updatedAt), "Pp", { locale: de })}
                  </td>
                  <td className={twJoin("hidden align-top @xl:table-cell", spaceClasses)}>
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
        </div>
      </TableWrapper>

      <SuperAdminLogData data={invites} />
    </>
  )
}
