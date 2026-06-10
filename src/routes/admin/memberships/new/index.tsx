import { createFileRoute } from "@tanstack/react-router"
import { PageAdminMembershipsNew } from "@/src/components/pages/admin/memberships/PageAdminMembershipsNew"
import { adminTitleHead } from "@/src/routeHead"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { usersAdminQueryOptions } from "@/src/server/users/usersQueryOptions"
import { membershipNewSearchSchema } from "@/src/shared/memberships/searchSchemas"

export const Route = createFileRoute("/admin/memberships/new/")({
  head: () => adminTitleHead("Mitglieschaft anlegen"),
  ssr: true,
  validateSearch: membershipNewSearchSchema,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersAdminQueryOptions())
    await context.queryClient.ensureQueryData(projectsAdminQueryOptions())
  },
  component: PageAdminMembershipsNew,
})
