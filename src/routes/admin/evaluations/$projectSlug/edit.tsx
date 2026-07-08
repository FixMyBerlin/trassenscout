import { createFileRoute } from "@tanstack/react-router"
import { PageAdminEvaluationsProjectSlugEdit } from "@/src/components/pages/admin/evaluations/PageAdminEvaluationsProjectSlugEdit"
import { adminTitleHead } from "@/src/routeHead"
import { evaluationsPageAdminQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"

export const Route = createFileRoute("/admin/evaluations/$projectSlug/edit")({
  head: ({ params }) => adminTitleHead(`Auswertungen-Seite: ${params.projectSlug}`),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      evaluationsPageAdminQueryOptions({ projectSlug: params.projectSlug }),
    ),
  component: PageAdminEvaluationsProjectSlugEdit,
})
