import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminEmailTemplateEditForm } from "@/src/components/admin/email-templates/[templateKey]/edit/AdminEmailTemplateEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"
import type { EmailTemplateKey } from "@/src/shared/emailTemplates/registry"

const routeApi = getRouteApi("/admin/email-templates/$templateKey/edit/")

export function PageAdminEmailTemplatesTemplateKeyEdit() {
  const { templateKey } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{ title: "E-Mail-Templates", href: "/admin/email-templates" }}
        title={templateKey}
      />
      <Suspense fallback={<Spinner page />}>
        <AdminEmailTemplateEditForm templateKey={templateKey as EmailTemplateKey} />
      </Suspense>
    </>
  )
}
