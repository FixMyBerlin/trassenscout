import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSupportDocumentsSupportDocumentIdEdit } from "@/src/components/pages/admin/support-documents/PageAdminSupportDocumentsSupportDocumentIdEdit"
import { adminTitleHead } from "@/src/routeHead"
import { supportDocumentQueryOptions } from "@/src/server/supportDocuments/supportDocumentsQueryOptions"

export const Route = createFileRoute("/admin/support-documents/$supportDocumentId/edit/")({
  head: () => adminTitleHead("Dokument bearbeiten"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      supportDocumentQueryOptions(Number(params.supportDocumentId)),
    ),
  component: PageAdminSupportDocumentsSupportDocumentIdEdit,
})
