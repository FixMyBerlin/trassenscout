import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { getFullname } from "@/src/components/core/users/getFullname"
import { UserCanIcon } from "@/src/components/shared/app/memberships/UserCanIcon"
import type { ProjectUsersList } from "@/src/server/memberships/types"
import { TeamTableEditMembershipDelete } from "./TeamTableEditMembershipDelete"
import { TeamTableEditMembershipModal } from "./TeamTableEditMembershipModal"

type Props = {
  users: ProjectUsersList
  projectSlug: string
}

export const TeamTable = ({ users }: Props) => {
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
                Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Telefon
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                E-Mail
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Rechte
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.email}>
                <td className="h-20 py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                  <div className="flex items-center font-medium text-gray-900">
                    {getFullname(user) ? getFullname(user) : <div className="pl-4">-</div>}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {user.phone ? <LinkTel>{user.phone}</LinkTel> : <div className="pl-4">-</div>}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  <LinkMail subject="Abstimmung zum RS 8">{user.email}</LinkMail>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
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
      </TableWrapper>

      <SuperAdminLogData data={users} />
    </>
  )
}
