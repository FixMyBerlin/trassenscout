import { createFileRoute } from "@tanstack/react-router"
import { PageSurveyResponseTags } from "@/src/components/pages/survey-response-tags/PageSurveyResponseTags"
import { privateTitleHead } from "@/src/routeHead"
import { surveyResponseTagsWithUsageCountQueryOptions } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/survey-response-tags/")({
  head: () => privateTitleHead("Tags (Beteiligung)"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      surveyResponseTagsWithUsageCountQueryOptions({
        projectSlug: params.projectSlug,
        includeArchived: true,
      }),
    ),
  component: PageSurveyResponseTags,
})
