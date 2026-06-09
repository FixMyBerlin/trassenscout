"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { Link } from "@/src/core/components/links"
import resetPassword from "@/src/server/auth/mutations/resetPassword"
import { ResetPassword, resetPasswordFormDefaultValues } from "@/src/server/auth/schema"
import { useMutation } from "@blitzjs/rpc"
import { useState } from "react"

type Props = { token: string }

export const ResetForm = ({ token }: Props) => {
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...resetPasswordFormDefaultValues, token },
    validators: { onSubmit: ResetPassword } as never,
    onSubmit: async ({ value }) => {
      try {
        await resetPasswordMutation({ ...value, token })
      } catch (error: unknown) {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "ResetPasswordError" &&
          "message" in error &&
          typeof error.message === "string"
        ) {
          applyFormSubmitResult(form, { [FORM_ERROR]: error.message }, setFormError)
        } else {
          applyFormSubmitResult(
            form,
            { [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again." },
            setFormError,
          )
        }
      }
    },
  })

  if (isSuccess) {
    return (
      <>
        <h2>Passwort erfolgreich zurückgesetzt.</h2>
        <p className="mt-5">
          <Link href="/dashboard" button>
            Zur Startseite
          </Link>
        </p>
      </>
    )
  }

  return (
    <FormShell form={form} formError={formError} submitText="Passwort zurücksetzen">
      <form.AppField name="password">
        {(field) => <field.TextField type="password" label="Neues Passwort" />}
      </form.AppField>
      <form.AppField name="passwordConfirmation">
        {(field) => <field.TextField type="password" label="Neues Passwort bestätigen" />}
      </form.AppField>
    </FormShell>
  )
}
