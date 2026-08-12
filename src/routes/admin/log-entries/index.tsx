import { createFileRoute } from "@tanstack/react-router"
import { PageAdminLogEntries } from "@/src/components/pages/admin/log-entries/PageAdminLogEntries"
import { adminTitleHead } from "@/src/routeHead"
import { generalLogEntriesQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/log-entries/")({
  head: () => adminTitleHead("Log-Einträge"),
  ssr: true,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(adminProjectsWithCountsQueryOptions()),
      context.queryClient.ensureQueryData(generalLogEntriesQueryOptions()),
    ]),
  component: PageAdminLogEntries,
})
