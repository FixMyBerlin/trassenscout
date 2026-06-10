import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { blueButtonStyles } from "@/src/components/core/components/links/styles"
import {
  deleteEmailTemplateFn,
  previewEmailTemplateFn,
  upsertEmailTemplateFn,
} from "@/src/server/emailTemplates/emailTemplates.functions"
import { emailTemplateQueryOptions } from "@/src/server/emailTemplates/emailTemplatesQueryOptions"
import type { EmailTemplatePreviewResult } from "@/src/server/emailTemplates/types"
import type { EmailTemplateKey } from "@/src/shared/emailTemplates/registry"
import {
  EmailTemplateFormSchema,
  type EmailTemplateFormValues,
} from "@/src/shared/emailTemplates/schemas"
import { EmailTemplateForm } from "./EmailTemplateForm"
import { EmailTemplatePreviewButton } from "./EmailTemplatePreviewButton"
import { EmailTemplatePreviewPanel } from "./EmailTemplatePreviewPanel"

type Props = {
  templateKey: EmailTemplateKey
}

export const AdminEmailTemplateEditForm = ({ templateKey }: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: template } = useSuspenseQuery(emailTemplateQueryOptions(templateKey))
  const upsertMutation = useMutation({ mutationFn: upsertEmailTemplateFn })
  const deleteMutation = useMutation({ mutationFn: deleteEmailTemplateFn })
  const previewMutation = useMutation({ mutationFn: previewEmailTemplateFn })

  const initialPreviewValues: EmailTemplateFormValues = {
    subject: template.subject,
    introMarkdown: template.introMarkdown,
    outroMarkdown: template.outroMarkdown,
    ctaText: template.ctaText,
  }

  const previewQueryKey = [
    "emailTemplatePreview",
    template.key,
    template.subject,
    template.introMarkdown,
    template.outroMarkdown,
    template.ctaText,
  ] as const

  const { data: preview = null } = useQuery<EmailTemplatePreviewResult>({
    queryKey: previewQueryKey,
    queryFn: () =>
      previewEmailTemplateFn({
        data: { key: template.key, ...initialPreviewValues },
      }),
  })

  const handlePreview = async (values: EmailTemplateFormValues) => {
    const nextPreview = await previewMutation.mutateAsync({
      data: { key: template.key, ...values },
    })
    queryClient.setQueryData(previewQueryKey, nextPreview)
    return nextPreview
  }

  const handleResetToDefaults = async () => {
    if (
      !window.confirm(
        "Möchten Sie den DB-Override wirklich löschen und auf den Code-Default zurücksetzen?",
      )
    ) {
      return
    }

    await deleteMutation.mutateAsync({ data: { key: template.key } })
    await queryClient.invalidateQueries({ queryKey: ["emailTemplate", templateKey] })
    const refreshed = await queryClient.fetchQuery(emailTemplateQueryOptions(templateKey))
    await handlePreview({
      subject: refreshed.subject,
      introMarkdown: refreshed.introMarkdown,
      outroMarkdown: refreshed.outroMarkdown,
      ctaText: refreshed.ctaText,
    })
  }

  const handleSubmit = async (values: EmailTemplateFormValues) => {
    try {
      await upsertMutation.mutateAsync({ data: { key: template.key, ...values } })
      await handlePreview(values)
      navigate({ to: "/admin/email-templates" })
    } catch (error: unknown) {
      console.error(error)
      return {
        [FORM_ERROR]: error instanceof Error ? error.message : String(error),
      }
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
              <EmailTemplatePreviewButton
                onPreview={async (values) => {
                  await handlePreview(values)
                }}
                disabled={previewMutation.isPending}
              />
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
