"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { supportDocumentFormDefaultValues } from "@/src/server/supportDocuments/schema"
import { ReactNode, useState } from "react"
import { z } from "zod"

export type SupportDocumentFormProps<S extends z.ZodType<any, any>> = {
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
  showFormDebug?: boolean
}

export function SupportDocumentForm<S extends z.ZodType<any, any>>({
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
  showFormDebug,
}: SupportDocumentFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...supportDocumentFormDefaultValues, ...initialValues },
    validators: { onSubmit: schema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value)) || {}
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
      showFormDebug={showFormDebug}
    >
      <form.AppField name="title">
        {(field) => <field.TextField type="text" label="Titel" />}
      </form.AppField>
      <form.AppField name="description">
        {(field) => <field.TextareaField label="Beschreibung" optional />}
      </form.AppField>
      <form.AppField name="order">
        {(field) => <field.NumberField label="Reihenfolge" />}
      </form.AppField>
    </FormShell>
  )
}
