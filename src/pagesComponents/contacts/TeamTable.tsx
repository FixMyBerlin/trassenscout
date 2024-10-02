import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { LinkMail, LinkTel } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { UserCanIcon } from "@/src/pagesComponents/memberships/UserCanIcon"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import { useQuery } from "@blitzjs/rpc"
import { TeamTableEditMembershipDelete } from "./TeamTableEditMembershipDelete"
import { TeamTableEditMembershipModal } from "./TeamTableEditMembershipModal"

export const TeamTable = () => {
  const projectSlug = useProjectSlug()
  const [users] = useQuery(getProjectUsers, { projectSlug })

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
                <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center font-medium text-gray-900">
                    {getFullname(user) ? getFullname(user) : <div className="pl-4">-</div>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {user.phone ? <LinkTel>{user.phone}</LinkTel> : <div className="pl-4">-</div>}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <LinkMail subject="Abstimmung zum RS 8">{user.email}</LinkMail>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
