"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { contactFormDefaultValues } from "@/src/server/contacts/schema"
import { ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export type ContactFormProps<S extends z.ZodType<any, any>> = {
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

export function ContactForm<S extends z.ZodType<any, any>>({
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
}: ContactFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...contactFormDefaultValues, ...initialValues },
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
      className={twMerge("max-w-prose", className)}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
      showFormDebug={showFormDebug}
    >
      <form.AppField name="firstName">
        {(field) => <field.TextField type="text" label="Vorname" optional placeholder="" />}
      </form.AppField>
      <form.AppField name="lastName">
        {(field) => <field.TextField type="text" label="Nachname" placeholder="" />}
      </form.AppField>
      <form.AppField name="email">
        {(field) => <field.TextField type="text" label="E-Mail-Adresse" placeholder="" />}
      </form.AppField>
      <form.AppField name="phone">
        {(field) => <field.TextField type="text" label="Telefonnummer" optional placeholder="" />}
      </form.AppField>
      <form.AppField name="note">
        {(field) => <field.TextareaField label="Notizen (Markdown)" optional placeholder="" />}
      </form.AppField>
      <form.AppField name="role">
        {(field) => <field.TextField type="text" label="Position" optional placeholder="" />}
      </form.AppField>
    </FormShell>
  )
}
