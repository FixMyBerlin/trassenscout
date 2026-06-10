import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSurveys } from "@/src/components/pages/admin/surveys/PageAdminSurveys"
import { adminTitleHead } from "@/src/routeHead"
import { adminSurveysQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/admin/surveys/")({
  head: () => adminTitleHead("Beteiligungen"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(adminSurveysQueryOptions()),
  component: PageAdminSurveys,
})
