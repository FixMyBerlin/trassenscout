import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecords } from "@/src/components/pages/admin/project-records/PageAdminProjectRecords"
import { adminTitleHead } from "@/src/routeHead"
import { allProjectRecordsAdminQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

export const Route = createFileRoute("/admin/project-records/")({
  head: () => adminTitleHead("Admin: Protokoll"),
  ssr: true,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(allProjectRecordsAdminQueryOptions()),
  component: PageAdminProjectRecords,
})
