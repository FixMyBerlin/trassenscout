import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoIndexTitle, shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/hooks"
import { LayoutArticle, MetaTags } from "@/src/core/layouts"
import deleteMembership from "@/src/memberships/mutations/deleteMembership"
import getUsersAndMemberships from "@/src/users/queries/getUsersAndMemberships"
import { getFullname } from "@/src/users/utils"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const AdminMemberships = () => {
  const projectSlug = useProjectSlug()
  const [{ users: userAndMemberships }] = useQuery(getUsersAndMemberships, {})

  const router = useRouter()
  const [deleteMembershipMutation] = useMutation(deleteMembership)
  const handleDelete = async (
    membership: (typeof userAndMemberships)[number]["memberships"][number],
  ) => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${membership.id} auf Projekt ${shortTitle(
          membership.project.slug,
        )} unwiderruflich löschen?`,
      )
    ) {
      await deleteMembershipMutation({ projectSlug: projectSlug!, membershipId: membership.id })
      await router.push(Routes.AdminMembershipsPage())
    }
  }

  return (
    <SuperAdminBox>
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">
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
                  <td className="h-20 py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <strong>{getFullname(user)}</strong>
                    <br />
                    {user.email}
                    {user.role === "ADMIN" && <>(Admin)</>}
                  </td>
                  <td className="h-20 py-4 pl-4 pr-3 text-sm sm:pr-6">
                    {user?.memberships?.length === 0 && <>Bisher keine Rechte</>}
                    {user?.memberships?.map((membership) => {
                      return (
                        <div key={membership.id} className="flex justify-between">
                          <Link
                            blank
                            href={Routes.ProjectDashboardPage({
                              projectSlug: membership.project.slug,
                            })}
                          >
                            {shortTitle(membership.project.slug)}
                          </Link>

                          <button onClick={() => handleDelete(membership)} className={linkStyles}>
                            {linkIcons["delete"]}
                          </button>
                        </div>
                      )
                    })}
                    <div className="mt-2 border-t pt-2">
                      <Link icon="plus" href={Routes.AdminNewMembershipPage({ userId: user.id })}>
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
    </SuperAdminBox>
  )
}

const AdminMembershipsPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title={seoIndexTitle("Zugriffsrechte")} />
      <PageHeader title="Zugriffsrechte" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <AdminMemberships />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link href={Routes.Home()}>Startseite</Link>
      </p>
    </LayoutArticle>
  )
}

AdminMembershipsPage.authenticate = { role: "ADMIN" }

export default AdminMembershipsPage
