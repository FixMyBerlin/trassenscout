import { Breadcrumb } from "@/src/app/(admin)/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/(admin)/admin/_components/HeaderWrapper"
import { invoke } from "@/src/blitz-server"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getUsersAndMemberships from "@/src/server/users/queries/getUsersAndMemberships"
import { Metadata } from "next"
import "server-only"
import { DeleteMembershipForm } from "./_components/DeleteMembershipForm"

export const metadata: Metadata = { title: "Nutzer & Mitgliedschaften" }

export default async function AdminProjectsPage() {
  const { users: userAndMemberships } = await invoke(getUsersAndMemberships, {})

  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/memberships", name: "Nutzer & Mitgliedschaften" },
          ]}
        />
      </HeaderWrapper>

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
            {userAndMemberships.map((user) => {
              return (
                <tr key={user.id}>
                  <td className="h-20 py-4 pr-3 pl-4 text-sm sm:pl-6">
                    <strong>{getFullname(user)}</strong>
                    <br />
                    {user.email}
                    {user.role === "ADMIN" && <> (Admin)</>}
                  </td>
                  <td className="h-20 py-4 pr-3 pl-4 text-sm sm:pr-6">
                    {user?.memberships?.length === 0 && <>Bisher keine Rechte</>}
                    {user?.memberships?.map((membership) => {
                      return (
                        <div key={membership.id} className="flex justify-between">
                          <Link blank href={`/${membership.project.slug}`}>
                            {shortTitle(membership.project.slug)}
                          </Link>

                          <DeleteMembershipForm membership={membership} />
                        </div>
                      )
                    })}
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <Link icon="plus" href={`/admin/memberships/new?userId=${user.id}`}>
                        Rechte
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrapper>
    </>
  )
}
