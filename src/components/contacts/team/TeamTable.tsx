import { useQuery } from "@tanstack/react-query"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
import { SortableTableHeader } from "@/src/components/core/components/Table/SortableTableHeader"
import {
  tableBodyClassName,
  tableCellClassName,
  tableColumnTiers,
  tableFixedClassName,
  tableHeadCellClassName,
  tableHeadCellRightClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { UserCanIcon } from "@/src/components/shared/app/memberships/UserCanIcon"
import type { ProjectUsersList } from "@/src/server/memberships/types"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import type { TeamTableSortColumn } from "@/src/shared/contacts/searchSchemas"
import { sortRows } from "@/src/shared/tableSort/sortRows"
import type { TableSort } from "@/src/shared/tableSort/tableSort"
import { TeamTableEditMembershipDelete } from "./TeamTableEditMembershipDelete"
import { TeamTableEditMembershipModal } from "./TeamTableEditMembershipModal"
import { teamSortValues } from "./teamTableSort"

/**
 * Column width classes for `table-fixed` layout. Adjust percentages here only.
 */
const teamTableColWidths = {
  name: "min-w-0 w-[65%] @xl:w-[40%]",
  phone: `${tableColumnTiers.from576.col} @xl:w-[14%]`,
  email: `${tableColumnTiers.from1024.col} @xl:w-[20%]`,
  rights: "w-[35%] @xl:w-[12%]",
  actions: `${tableColumnTiers.from576.col} @xl:w-[14%]`,
} as const

type Props = {
  users: ProjectUsersList
  sort?: TableSort<TeamTableSortColumn>
  onSortClick?: (column: TeamTableSortColumn) => void
}

const editableMembershipRoles = ["VIEWER", "EDITOR"]

export const TeamTable = ({ users, sort, onSortClick }: Props) => {
  const { data: currentUser } = useQuery(currentUserQueryOptions())

  if (!users.length) {
    return (
      <>
        <ZeroCase visible={users.length} name="Teammitglieder" verb="registriert" />
        <SuperAdminLogData data={users} />
      </>
    )
  }

  return (
    <>
      <TableWrapper className="@container">
        <div className="w-full">
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
                <SortableTableHeader column="name" sort={sort} onSortClick={onSortClick}>
                  Name
                </SortableTableHeader>
                <th
                  scope="col"
                  className={twJoin(tableHeadCellClassName, tableColumnTiers.from576.cell)}
                >
                  Telefon
                </th>
                <th
                  scope="col"
                  className={twJoin(tableHeadCellClassName, tableColumnTiers.from1024.cell)}
                >
                  E-Mail
                </th>
                <SortableTableHeader column="role" sort={sort} onSortClick={onSortClick}>
                  Rechte
                </SortableTableHeader>
                <th
                  scope="col"
                  className={twJoin(tableHeadCellRightClassName, tableColumnTiers.from576.cell)}
                >
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody className={tableBodyClassName}>
              {sortRows(users, teamSortValues, sort).map((user) => {
                const canEditMembership = editableMembershipRoles.includes(
                  user.currentMembershipRole,
                )
                const userLabel = getFullnameWithInstitution(user) || "—"

                return (
                  <tr key={user.email} className={tableRowClassName}>
                    <td className={twJoin(tableCellClassName, "min-w-0 align-middle")}>
                      <span
                        className="line-clamp-2 min-w-0 leading-snug break-words"
                        title={userLabel}
                      >
                        {userLabel}
                      </span>
                    </td>
                    <td
                      className={twJoin(
                        tableCellClassName,
                        "align-middle whitespace-nowrap",
                        tableColumnTiers.from576.cell,
                      )}
                    >
                      {user.phone ? <LinkTel>{user.phone}</LinkTel> : "—"}
                    </td>
                    <td
                      className={twJoin(
                        "align-middle whitespace-nowrap",
                        tableColumnTiers.from1024.cell,
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
                      {user.isProjectLead && (
                        <div className="text-sm text-gray-500">Projektleitung</div>
                      )}
                    </td>
                    <td
                      className={twJoin(
                        "align-middle text-sm font-medium whitespace-nowrap",
                        tableColumnTiers.from576.cell,
                        tableCellClassName,
                      )}
                    >
                      {user.id !== currentUser?.id && (
                        <div className="flex flex-col items-end gap-1">
                          {canEditMembership && <TeamTableEditMembershipModal editUser={user} />}
                          <TeamTableEditMembershipDelete membershipId={user.currentMembershipId} />
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </TableWrapper>

      <SuperAdminLogData data={users} />
    </>
  )
}
