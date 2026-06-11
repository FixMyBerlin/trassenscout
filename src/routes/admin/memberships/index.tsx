import { createFileRoute } from "@tanstack/react-router"
import { PageAdminMemberships } from "@/src/components/pages/admin/memberships/PageAdminMemberships"
import { adminTitleHead } from "@/src/routeHead"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { usersWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"
import { membershipsSearchSchema } from "@/src/shared/memberships/searchSchemas"

export const Route = createFileRoute("/admin/memberships/")({
  head: () => adminTitleHead("Nutzer & Rechte"),
  ssr: true,
  validateSearch: membershipsSearchSchema,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(usersWithMembershipsQueryOptions()),
      context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
    ])
  },
  component: PageAdminMemberships,
})
