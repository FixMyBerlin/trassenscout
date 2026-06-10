import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSupportDocuments } from "@/src/components/pages/admin/support-documents/PageAdminSupportDocuments"
import { adminTitleHead } from "@/src/routeHead"
import { supportDocumentsQueryOptions } from "@/src/server/supportDocuments/supportDocumentsQueryOptions"

export const Route = createFileRoute("/admin/support-documents/")({
  head: () => adminTitleHead("Support-Dokumente"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(supportDocumentsQueryOptions()),
  component: PageAdminSupportDocuments,
})
