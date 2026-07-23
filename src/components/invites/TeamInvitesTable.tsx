import { endOfDay, format, formatDistanceStrict, subDays } from "date-fns"
import { de } from "date-fns/locale"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { StatusLabel } from "@/src/components/core/components/Status/StatusLabel"
import {
  tableBodyClassName,
  tableCellClassName,
  tableFixedClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
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

  return (
    <>
      <TableWrapper>
        <div className="@container w-full">
          <table className={tableFixedClassName}>
            <colgroup>
              <col className={teamInvitesTableColWidths.status} />
              <col className={teamInvitesTableColWidths.email} />
              <col className={teamInvitesTableColWidths.role} />
              <col className={teamInvitesTableColWidths.inviter} />
              <col className={teamInvitesTableColWidths.date} />
              <col className={teamInvitesTableColWidths.validity} />
            </colgroup>
            <thead>
              <tr className={tableHeadRowClassName}>
                <th scope="col" className={tableHeadCellClassName}>
                  Status
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  E-Mail
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Rechte
                </th>
                <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                  Einladung von
                </th>
                <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                  Datum
                </th>
                <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                  Gültigkeit
                </th>
              </tr>
            </thead>
            <tbody className={tableBodyClassName}>
              {invites.map((invite) => (
                <tr key={invite.id} className={tableRowClassName}>
                  <td className={twJoin(tableCellClassName, "align-top")}>
                    <StatusLabel
                      label={inviteStatusLabels[invite.status]}
                      className={twJoin(inviteStatusClassNames[invite.status], "inline-flex")}
                    />
                  </td>
                  <td className={twJoin(tableCellClassName, "min-w-0 align-top")}>
                    <LinkMail>{invite.email}</LinkMail>
                  </td>
                  <td className={twJoin(tableCellClassName, "align-top whitespace-nowrap")}>
                    {roleTranslation[invite.role]}
                  </td>
                  <td className={twJoin("hidden align-top @xl:table-cell", tableCellClassName)}>
                    {getFullname(invite.inviter)}
                  </td>
                  <td className={twJoin("hidden align-top @xl:table-cell", tableCellClassName)}>
                    {format(new Date(invite.updatedAt), "Pp", { locale: de })}
                  </td>
                  <td className={twJoin("hidden align-top @xl:table-cell", tableCellClassName)}>
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
