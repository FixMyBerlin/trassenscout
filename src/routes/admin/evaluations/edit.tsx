import { createFileRoute } from "@tanstack/react-router"
import { PageAdminEvaluationsEdit } from "@/src/components/pages/admin/evaluations/PageAdminEvaluationsEdit"
import { adminTitleHead } from "@/src/routeHead"
import { evaluationsPageQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"

export const Route = createFileRoute("/admin/evaluations/edit")({
  head: () => adminTitleHead("Auswertungen-Seite bearbeiten"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(evaluationsPageQueryOptions()),
  component: PageAdminEvaluationsEdit,
})
