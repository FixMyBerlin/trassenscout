import { createFileRoute } from "@tanstack/react-router"
import { PageAdminMembershipsUser } from "@/src/components/pages/admin/memberships/PageAdminMembershipsUser"
import { adminTitleHead } from "@/src/routeHead"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { userWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"

function AdminMembershipsUserRoute() {
  const { userId } = Route.useParams()
  return <PageAdminMembershipsUser userId={Number(userId)} />
}

export const Route = createFileRoute("/admin/memberships/$userId/")({
  head: () => adminTitleHead("Nutzer-Rechte bearbeiten"),
  ssr: true,
  loader: async ({ context, params }) => {
    const userId = Number(params.userId)
    await Promise.all([
      context.queryClient.ensureQueryData(userWithMembershipsQueryOptions(userId)),
      context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
    ])
  },
  component: AdminMembershipsUserRoute,
})
