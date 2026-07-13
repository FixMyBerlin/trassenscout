import { createFileRoute } from "@tanstack/react-router"
import { PageAdminEvaluations } from "@/src/components/pages/admin/evaluations/PageAdminEvaluations"
import { adminTitleHead } from "@/src/routeHead"
import { evaluationsPagesQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"

export const Route = createFileRoute("/admin/evaluations/")({
  head: () => adminTitleHead("Auswertungen-Seiten"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(evaluationsPagesQueryOptions()),
  component: PageAdminEvaluations,
})
