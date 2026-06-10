import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageSurveyResponseUploadEdit } from "@/src/components/pages/uploads/PageSurveyResponseUploadEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/surveys/$surveyId/responses/$surveyResponseId/uploads/$uploadId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Dokument")),
  ssr: true,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        uploadQueryOptions({
          projectSlug: params.projectSlug,
          id: Number(params.uploadId),
        }),
      ),
      context.queryClient.ensureQueryData(
        subsubsectionsQueryOptions({ projectSlug: params.projectSlug }),
      ),
      context.queryClient.ensureQueryData(
        acquisitionAreasQueryOptions({ projectSlug: params.projectSlug }),
      ),
    ]),
  component: PageSurveyResponseUploadEdit,
})
