import { ReactNode, useState } from "react"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { emailTemplateFormDefaultValues } from "@/src/shared/emailTemplates/schemas"

export type EmailTemplateFormProps<S extends z.ZodType> = {
  schema: S
  initialValues?: Partial<z.infer<S>>
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  submitText: string
  resetOnSubmit?: boolean
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  submitDisabled?: boolean
  submitClassName?: string
  supportsCta: boolean
}

export function EmailTemplateForm<S extends z.ZodType>({
  schema,
  initialValues,
  onSubmit,
  submitText,
  resetOnSubmit,
  className,
  actionBarLeft,
  actionBarRight,
  submitDisabled,
  submitClassName,
  supportsCta,
}: EmailTemplateFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...emailTemplateFormDefaultValues, ...initialValues },
    validators: { onSubmit: schema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value as z.infer<S>)) || {}
      applyFormSubmitResult(form, result, setFormError)
      if (resetOnSubmit && !result.FORM_ERROR) {
        form.reset()
        setFormError(null)
      }
    },
  })

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      className={className}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
      backLink={null}
    >
      <form.AppField name="subject">
        {(field) => <field.TextField type="text" label="Subject" />}
      </form.AppField>
      <form.AppField name="introMarkdown">
        {(field) => <field.TextareaField label="Intro Markdown" rows={10} />}
      </form.AppField>
      <form.AppField name="outroMarkdown">
        {(field) => <field.TextareaField label="Outro Markdown" rows={8} optional />}
      </form.AppField>
      <form.AppField name="ctaText">
        {(field) =>
          supportsCta ? (
            <field.TextField type="text" label="CTA Text" optional />
          ) : (
            <field.TextField
              type="text"
              label="CTA Text"
              optional
              disabled
              help="Dieser E-Mail-Typ hat aktuell keinen CTA-Link."
            />
          )
        }
      </form.AppField>
    </FormShell>
  )
}
