"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import updateUser from "@/src/server/auth/mutations/updateUser"
import {
  updateUserFormDefaultValues,
  UpdateUserSchema,
  UpdateUserType,
} from "@/src/server/auth/schema"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const UserEditForm = () => {
  const router = useRouter()
  const user = useCurrentUser()
  const [updateUserMutation] = useMutation(updateUser)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (values: UpdateUserType) => {
    try {
      await updateUserMutation(values)
      router.push("/dashboard")
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  const form = useAppForm({
    defaultValues: { ...updateUserFormDefaultValues, ...user },
    validators: { onSubmit: UpdateUserSchema } as never,
    onSubmit: async ({ value }) => {
      const result = (await handleSubmit(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
    },
  })

  if (!user) return null

  return (
    <>
      <FormShell form={form} formError={formError} submitText="Speichern" className="max-w-prose">
        <form.AppField name="firstName">
          {(field) => (
            <field.TextField type="text" label="Vorname" placeholder="" autoComplete="given-name" />
          )}
        </form.AppField>
        <form.AppField name="lastName">
          {(field) => (
            <field.TextField
              type="text"
              label="Nachname"
              placeholder=""
              autoComplete="family-name"
            />
          )}
        </form.AppField>
        <form.AppField name="institution">
          {(field) => (
            <field.TextField type="text" label="Organisation / Kommune" placeholder="" optional />
          )}
        </form.AppField>
        <form.AppField name="phone">
          {(field) => (
            <field.TextField
              type="tel"
              label="Telefon"
              placeholder=""
              autoComplete="tel"
              optional
            />
          )}
        </form.AppField>
      </FormShell>
      <SuperAdminLogData data={user} />
    </>
  )
}
