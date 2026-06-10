import { createFileRoute } from "@tanstack/react-router"
import { PageAdminEmailTemplatesTemplateKeyEdit } from "@/src/components/pages/admin/email-templates/PageAdminEmailTemplatesTemplateKeyEdit"
import { adminTitleHead } from "@/src/routeHead"
import { emailTemplateQueryOptions } from "@/src/server/emailTemplates/emailTemplatesQueryOptions"
import type { EmailTemplateKey } from "@/src/shared/emailTemplates/registry"

export const Route = createFileRoute("/admin/email-templates/$templateKey/edit/")({
  head: () => adminTitleHead("E-Mail-Template bearbeiten"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      emailTemplateQueryOptions(params.templateKey as EmailTemplateKey),
    ),
  component: PageAdminEmailTemplatesTemplateKeyEdit,
})
