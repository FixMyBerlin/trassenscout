"use client"

import { FORM_ERROR } from "@/src/core/components/forms"
import { EmailTemplateKey } from "@/src/server/emailTemplates/registry"
import previewEmailTemplate from "@/src/server/emailTemplates/mutations/previewEmailTemplate"
import upsertEmailTemplate from "@/src/server/emailTemplates/mutations/upsertEmailTemplate"
import getEmailTemplate from "@/src/server/emailTemplates/queries/getEmailTemplate"
import { EmailTemplateFormSchema, EmailTemplateFormValues } from "@/src/server/emailTemplates/schema"
import { EmailTemplatePreviewResult } from "@/src/server/emailTemplates/types"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { EmailTemplateForm } from "./EmailTemplateForm"
import { EmailTemplatePreviewButton } from "./EmailTemplatePreviewButton"
import { EmailTemplatePreviewPanel } from "./EmailTemplatePreviewPanel"

export const AdminEmailTemplateEditForm = () => {
  const router = useRouter()
  const templateKey = String(useParams()?.templateKey) as EmailTemplateKey
  const [template] = useQuery(getEmailTemplate, { key: templateKey })
  const [upsertEmailTemplateMutation] = useMutation(upsertEmailTemplate)
  const [previewEmailTemplateMutation, { isLoading: previewLoading }] =
    useMutation(previewEmailTemplate)
  const [preview, setPreview] = useState<EmailTemplatePreviewResult | null>(null)

  const handlePreview = async (values: EmailTemplateFormValues) => {
    const nextPreview = await previewEmailTemplateMutation({
      key: template.key,
      ...values,
    })

    setPreview(nextPreview)
  }

  useEffect(() => {
    void handlePreview({
      subject: template.subject,
      introMarkdown: template.introMarkdown,
      outroMarkdown: template.outroMarkdown,
      ctaText: template.ctaText,
    })
    // We only want the initial preview after template load/change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.key])

  const handleSubmit = async (values: EmailTemplateFormValues) => {
    try {
      await upsertEmailTemplateMutation({
        key: template.key,
        ...values,
      })
      await handlePreview(values)
      router.push("/admin/email-templates")
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error.message || String(error) }
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section>
        <div className="mb-4 rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold">{template.name}</h2>
          <p className="mt-1 text-sm text-gray-600">{template.description}</p>
          <p className="mt-2 text-sm">
            Quelle: {template.source === "db" ? "DB-Override" : "Code-Default"}
          </p>
          <p className="mt-1 text-sm text-gray-600">Key: {template.key}</p>
        </div>

        <EmailTemplateForm
          submitText="Speichern"
          schema={EmailTemplateFormSchema}
          initialValues={{
            subject: template.subject,
            introMarkdown: template.introMarkdown,
            outroMarkdown: template.outroMarkdown,
            ctaText: template.ctaText,
          }}
          onSubmit={handleSubmit}
          actionBarLeft={
            <EmailTemplatePreviewButton onPreview={handlePreview} disabled={previewLoading} />
          }
        />
      </section>

      <EmailTemplatePreviewPanel
        preview={preview}
        allowedVariables={template.allowedVariables}
        sampleContext={template.sampleContext}
      />
    </div>
  )
}
