import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
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
import { UserCanIcon } from "@/src/components/shared/app/memberships/UserCanIcon"
import type { ProjectUsersList } from "@/src/server/memberships/types"
import { TeamTableEditMembershipDelete } from "./TeamTableEditMembershipDelete"
import { TeamTableEditMembershipModal } from "./TeamTableEditMembershipModal"

/**
 * Column width classes for `table-fixed` layout. Adjust percentages here only.
 */
const teamTableColWidths = {
  name: "min-w-0 w-[40%] @xl:w-[28%]",
  phone: "w-[30%] @xl:w-[20%]",
  email: "hidden @xl:table-column @xl:w-[32%]",
  rights: "w-[30%] @xl:w-[20%]",
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
              </tr>
            </thead>
            <tbody className={tableBodyClassName}>
              {users.map((user) => (
                <tr key={user.email} className={tableRowClassName}>
                  <td className={twJoin(tableCellClassName, "align-top")}>
                    {getFullname(user) || "—"}
                  </td>
                  <td className={twJoin(tableCellClassName, "align-top whitespace-nowrap")}>
                    {user.phone ? <LinkTel>{user.phone}</LinkTel> : "—"}
                  </td>
                  <td
                    className={twJoin(
                      "hidden align-top whitespace-nowrap @xl:table-cell",
                      tableCellClassName,
                    )}
                  >
                    <LinkMail subject="Abstimmung zum RS 8">{user.email}</LinkMail>
                  </td>
                  <td className={twJoin(tableCellClassName, "align-top")}>
                    <div className="flex items-center gap-2">
                      <UserCanIcon
                        role={user.currentMembershipRole}
                        isAdmin={user.role === "ADMIN"}
                      />
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
