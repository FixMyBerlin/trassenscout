import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSystemLogEntries } from "@/src/components/pages/admin/system-log-entries/PageAdminSystemLogEntries"
import { adminTitleHead } from "@/src/routeHead"
import { systemLogEntriesQueryOptions } from "@/src/server/systemLogEntries/systemLogEntriesQueryOptions"
import { systemLogEntriesSearchSchema } from "@/src/shared/systemLogEntries/searchSchemas"

export const Route = createFileRoute("/admin/system-log-entries/")({
  head: () => adminTitleHead("System-Logs"),
  ssr: true,
  validateSearch: systemLogEntriesSearchSchema,
  loaderDeps: ({ search: { page, pageSize } }) => ({ page, pageSize }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(systemLogEntriesQueryOptions(deps)),
  component: PageAdminSystemLogEntries,
})
