import { useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { DeleteMembershipForm } from "@/src/components/admin/memberships/DeleteMembershipForm"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import { usersWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"

export function PageAdminMemberships() {
  const { data: users } = useSuspenseQuery(usersWithMembershipsQueryOptions())

  return (
    <>
      <AdminPageHeader
        title="Nutzer & Rechte"
        action={
          <CoreLink to="/admin/memberships/new" button className={adminHeaderActionButtonClassName}>
            Neue Mitgliedschaft
          </CoreLink>
        }
      />
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-6">
                User
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold sm:pr-6">
                Projekt
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="h-20 py-4 pr-3 pl-4 text-sm sm:pl-6">
                  <strong>{getFullname(user)}</strong>
                  <br />
                  {user.email}
                  {user.role === "ADMIN" && <> (Admin)</>}
                </td>
                <td className="h-20 py-4 pr-3 pl-4 text-sm sm:pr-6">
                  {user.memberships.length === 0 && <>Bisher keine Rechte</>}
                  {user.memberships.map((membership) => (
                    <div key={membership.id} className="flex justify-between">
                      <CoreLink blank to={`/${membership.project.slug}`}>
                        {shortTitle(membership.project.slug)}
                      </CoreLink>
                      <DeleteMembershipForm membership={membership} />
                    </div>
                  ))}
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <CoreLink icon="plus" to={`/admin/memberships/new?userId=${user.id}`}>
                      Rechte
                    </CoreLink>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </>
  )
}
