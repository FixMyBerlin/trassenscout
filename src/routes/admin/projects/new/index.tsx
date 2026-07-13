import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectsNew } from "@/src/components/pages/admin/projects/PageAdminProjectsNew"
import { adminTitleHead } from "@/src/routeHead"
import { usersAdminQueryOptions } from "@/src/server/users/usersQueryOptions"

export const Route = createFileRoute("/admin/projects/new/")({
  head: () => adminTitleHead("Projekt hinzufügen"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(usersAdminQueryOptions()),
  component: PageAdminProjectsNew,
})
