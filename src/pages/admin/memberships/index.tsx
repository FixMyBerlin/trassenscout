import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Membership, Project, User } from "@prisma/client"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { seoIndexTitle, shortTitle } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getMemberships from "src/memberships/queries/getMemberships"
import getAdminStatus from "src/users/queries/getAdminStatus"
import { getFullname } from "src/users/utils"

const ITEMS_PER_PAGE = 100

const AdminMemberships = () => {
  useQuery(getAdminStatus, {}) // See https://github.com/FixMyBerlin/private-issues/issues/936

  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [result] = useQuery(getMemberships, {
    include: { user: true, project: true },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const { hasMore } = result
  const memberships = result.memberships as (Membership & { user: User; project: Project })[]
  // const [createMembershipMutation] = useMutation(createMembership)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  // type HandleSubmit = any // TODO
  // const handleSubmit = async (values: HandleSubmit) => {
  //  const partnerLogoSrcsArray = values.partnerLogoSrcs.split("\n")
  //  values = { ...values, partnerLogoSrcs: partnerLogoSrcsArray }
  //  try {
  //   const project = await createProjectMutation(values)

  //   // Create a membership for the selected user
  //   if (project.managerId) {
  //    try {
  //     await createMembershipMutation({ projectId: project.id, userId: project.managerId })
  //    } catch (error: any) {
  //     console.error(error)
  //     return { [FORM_ERROR]: error }
  //    }
  //   }

  //   await router.push(Routes.ProjectDashboardPage({ projectSlug: project.slug }))
  //  } catch (error: any) {
  //   console.error(error)
  //   return { [FORM_ERROR]: error }
  //  }
  // }

  return (
    <>
      <SuperAdminBox>
        <TableWrapper>
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6"
                >
                  User
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold sm:pr-6">
                  Projekt
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {memberships.map((membership) => {
                return (
                  <tr key={membership.id}>
                    <td className="h-20 py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <strong>{getFullname(membership.user)}</strong>
                      <br />
                      {membership.user.email}
                    </td>
                    <td className="h-20 py-4 pl-4 pr-3 text-sm sm:pr-6">
                      <Link
                        blank
                        href={Routes.ProjectDashboardPage({ projectSlug: membership.project.slug })}
                      >
                        {shortTitle(membership.project.slug)}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableWrapper>

        <Pagination
          hasMore={hasMore}
          page={page}
          handlePrev={goToPreviousPage}
          handleNext={goToNextPage}
        />
      </SuperAdminBox>
    </>
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

// See https://github.com/FixMyBerlin/private-issues/issues/936
// AdminMembershipsPage.authenticate = { role: "ADMIN" }
AdminMembershipsPage.authenticate = true

export default AdminMembershipsPage
