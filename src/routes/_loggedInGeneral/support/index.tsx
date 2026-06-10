import { createFileRoute } from "@tanstack/react-router"
import { PageSupport } from "@/src/components/pages/PageSupport"
import { privateTitleHead } from "@/src/routeHead"
import { supportDocumentsQueryOptions } from "@/src/server/supportDocuments/supportDocumentsQueryOptions"

export const Route = createFileRoute("/_loggedInGeneral/support/")({
  head: () => privateTitleHead("Support & Dokumentation"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(supportDocumentsQueryOptions()),
  component: PageSupport,
})
