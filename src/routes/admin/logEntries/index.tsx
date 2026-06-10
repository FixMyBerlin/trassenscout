import { createFileRoute } from "@tanstack/react-router"
import { PageAdminLogEntries } from "@/src/components/pages/admin/log-entries/PageAdminLogEntries"
import { adminTitleHead } from "@/src/routeHead"
import { systemLogEntriesQueryOptions } from "@/src/server/systemLogEntries/systemLogEntriesQueryOptions"
import { systemLogEntriesSearchSchema } from "@/src/shared/systemLogEntries/searchSchemas"

export const Route = createFileRoute("/admin/logEntries/")({
  head: () => adminTitleHead("LogEntries"),
  ssr: true,
  validateSearch: systemLogEntriesSearchSchema,
  loaderDeps: ({ search: { page, pageSize } }) => ({ page, pageSize }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(systemLogEntriesQueryOptions(deps)),
  component: PageAdminLogEntries,
})
