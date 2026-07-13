import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageSurveyResponseTagsEdit } from "@/src/components/pages/survey-response-tags/PageSurveyResponseTagsEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { surveyResponseTagsWithUsageCountQueryOptions } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/survey-response-tags/$tagId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Tag")),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      surveyResponseTagsWithUsageCountQueryOptions({
        projectSlug: params.projectSlug,
        includeArchived: true,
      }),
    ),
  component: PageSurveyResponseTagsEdit,
})
