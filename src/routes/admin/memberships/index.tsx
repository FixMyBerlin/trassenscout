import { createFileRoute } from "@tanstack/react-router"
import { PageAdminMemberships } from "@/src/components/pages/admin/memberships/PageAdminMemberships"
import { adminTitleHead } from "@/src/routeHead"
import { usersWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"

export const Route = createFileRoute("/admin/memberships/")({
  head: () => adminTitleHead("Nutzer & Rechte"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(usersWithMembershipsQueryOptions()),
  component: PageAdminMemberships,
})
