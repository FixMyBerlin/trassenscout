import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageUploadEdit } from "@/src/components/pages/uploads/PageUploadEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { uploadEditSearchSchema } from "@/src/shared/uploads/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/uploads/$uploadId/edit/")({
  head: () => absoluteTitleHead(seoEditTitle("Dokument")),
  ssr: true,
  validateSearch: uploadEditSearchSchema,
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
  component: PageUploadEdit,
})
