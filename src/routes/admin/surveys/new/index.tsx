import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSurveysNew } from "@/src/components/pages/admin/surveys/PageAdminSurveysNew"
import { adminTitleHead } from "@/src/routeHead"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/surveys/new/")({
  head: () => adminTitleHead("Neue Beteiligung erstellen"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
  component: PageAdminSurveysNew,
})
