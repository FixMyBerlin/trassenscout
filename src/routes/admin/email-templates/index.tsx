import { createFileRoute } from "@tanstack/react-router"
import { PageAdminEmailTemplates } from "@/src/components/pages/admin/email-templates/PageAdminEmailTemplates"
import { adminTitleHead } from "@/src/routeHead"
import { emailTemplatesQueryOptions } from "@/src/server/emailTemplates/emailTemplatesQueryOptions"

export const Route = createFileRoute("/admin/email-templates/")({
  head: () => adminTitleHead("E-Mail-Templates"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(emailTemplatesQueryOptions()),
  component: PageAdminEmailTemplates,
})
