import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
import {
  tableBodyClassName,
  tableCellClassName,
  tableFixedClassName,
  tableHeadCellClassName,
  tableHeadCellRightClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { getFullname } from "@/src/components/core/users/getFullname"
import { UserCanIcon } from "@/src/components/shared/app/memberships/UserCanIcon"
import type { ProjectUsersList } from "@/src/server/memberships/types"
import { TeamTableEditMembershipDelete } from "./TeamTableEditMembershipDelete"
import { TeamTableEditMembershipModal } from "./TeamTableEditMembershipModal"

/**
 * Column width classes for `table-fixed` layout. Adjust percentages here only.
 */
const teamTableColWidths = {
  name: "min-w-0 w-[32%] @xl:w-[24%]",
  phone: "w-[24%] @xl:w-[16%]",
  email: "hidden @xl:table-column @xl:w-[28%]",
  rights: "w-[22%] @xl:w-[14%]",
  actions: "w-[22%] @xl:w-[18%]",
} as const

type Props = {
  users: ProjectUsersList
  projectSlug: string
}

export const TeamTable = ({ users }: Props) => {
  return (
    <>
      <TableWrapper>
        <div className="@container w-full">
          <table className={tableFixedClassName}>
            <colgroup>
              <col className={teamTableColWidths.name} />
              <col className={teamTableColWidths.phone} />
              <col className={teamTableColWidths.email} />
              <col className={teamTableColWidths.rights} />
              <col className={teamTableColWidths.actions} />
            </colgroup>
            <thead>
              <tr className={tableHeadRowClassName}>
                <th scope="col" className={tableHeadCellClassName}>
                  Name
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Telefon
                </th>
                <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                  E-Mail
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Rechte
                </th>
                <th scope="col" className={tableHeadCellRightClassName}>
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody className={tableBodyClassName}>
              {users.map((user) => (
                <tr key={user.email} className={tableRowClassName}>
                  <td className={twJoin(tableCellClassName, "align-middle")}>
                    {getFullname(user) || "—"}
                  </td>
                  <td className={twJoin(tableCellClassName, "align-middle whitespace-nowrap")}>
                    {user.phone ? <LinkTel>{user.phone}</LinkTel> : "—"}
                  </td>
                  <td
                    className={twJoin(
                      "hidden align-middle whitespace-nowrap @xl:table-cell",
                      tableCellClassName,
                    )}
                  >
                    <LinkMail subject="Abstimmung zum RS 8">{user.email}</LinkMail>
                  </td>
                  <td className={twJoin(tableCellClassName, "align-middle whitespace-nowrap")}>
                    <UserCanIcon
                      role={user.currentMembershipRole}
                      isAdmin={user.role === "ADMIN"}
                    />
                  </td>
                  <td
                    className={twJoin(
                      "align-middle text-sm font-medium whitespace-nowrap",
                      tableCellClassName,
                    )}
                  >
                    <div className="flex flex-col items-end gap-1">
                      <TeamTableEditMembershipModal editUser={user} />
                      <TeamTableEditMembershipDelete membershipId={user.currentMembershipId} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableWrapper>

      <SuperAdminLogData data={users} />
    </>
  )
}
