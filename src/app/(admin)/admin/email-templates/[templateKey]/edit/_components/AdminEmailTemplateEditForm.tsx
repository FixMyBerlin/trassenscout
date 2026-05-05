"use client"

import { FORM_ERROR } from "@/src/core/components/forms"
import { blueButtonStyles } from "@/src/core/components/links"
import deleteEmailTemplate from "@/src/server/emailTemplates/mutations/deleteEmailTemplate"
import previewEmailTemplate from "@/src/server/emailTemplates/mutations/previewEmailTemplate"
import upsertEmailTemplate from "@/src/server/emailTemplates/mutations/upsertEmailTemplate"
import getEmailTemplate from "@/src/server/emailTemplates/queries/getEmailTemplate"
import { EmailTemplateKey } from "@/src/server/emailTemplates/registry"
import {
  EmailTemplateFormSchema,
  EmailTemplateFormValues,
} from "@/src/server/emailTemplates/schema"
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
  const [template, { refetch }] = useQuery(getEmailTemplate, { key: templateKey })
  const [upsertEmailTemplateMutation] = useMutation(upsertEmailTemplate)
  const [deleteEmailTemplateMutation] = useMutation(deleteEmailTemplate)
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
  }, [
    template.key,
    template.subject,
    template.introMarkdown,
    template.outroMarkdown,
    template.ctaText,
  ])

  const handleResetToDefaults = async () => {
    if (
      !window.confirm(
        "Möchten Sie den DB-Override wirklich löschen und auf den Code-Default zurücksetzen?",
      )
    ) {
      return
    }

    await deleteEmailTemplateMutation({ key: template.key })
    const result = await refetch()

    if (result.data) {
      await handlePreview({
        subject: result.data.subject,
        introMarkdown: result.data.introMarkdown,
        outroMarkdown: result.data.outroMarkdown,
        ctaText: result.data.ctaText,
      })
    }
  }

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
          key={`${template.key}:${template.source}:${template.subject}:${template.introMarkdown}:${template.outroMarkdown}:${template.ctaText}`}
          submitText="Speichern"
          schema={EmailTemplateFormSchema}
          initialValues={{
            subject: template.subject,
            introMarkdown: template.introMarkdown,
            outroMarkdown: template.outroMarkdown,
            ctaText: template.ctaText,
          }}
          supportsCta={template.supportsCta}
          onSubmit={handleSubmit}
          actionBarLeft={
            <>
              <EmailTemplatePreviewButton onPreview={handlePreview} disabled={previewLoading} />
              {template.source === "db" && (
                <button
                  type="button"
                  className={blueButtonStyles}
                  onClick={() => void handleResetToDefaults()}
                >
                  DB-Override löschen
                </button>
              )}
            </>
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
