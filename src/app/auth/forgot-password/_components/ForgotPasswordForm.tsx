"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { frenchQuote } from "@/src/core/components/text/quote"
import forgotPassword from "@/src/server/auth/mutations/forgotPassword"
import { ForgotPassword, forgotPasswordFormDefaultValues } from "@/src/server/auth/schema"
import { useMutation } from "@blitzjs/rpc"
import { useState } from "react"

export const ForgotPasswordForm = () => {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: forgotPasswordFormDefaultValues,
    validators: { onSubmit: ForgotPassword } as never,
    onSubmit: async ({ value }) => {
      try {
        await forgotPasswordMutation(value)
      } catch {
        const result = {
          [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
        }
        applyFormSubmitResult(form, result, setFormError)
      }
    },
  })

  if (isSuccess) {
    return (
      <div className="prose">
        <p>Wenn Ihre E-Mail-Adresse im System ist, sollten Sie eine E-Mail bekommen haben.</p>
        <p>Klicken Sie darin auf den Link {frenchQuote("Ein neues Passwort vergeben")}.</p>
      </div>
    )
  }

  return (
    <FormShell form={form} formError={formError} submitText="E-Mail zusenden">
      <form.AppField name="email">
        {(field) => (
          <field.TextField type="text" label="E-Mail-Adresse" placeholder="name@beispiel.de" />
        )}
      </form.AppField>
    </FormShell>
  )
}
