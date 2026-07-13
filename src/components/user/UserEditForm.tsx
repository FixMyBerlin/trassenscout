import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useCurrentUser } from "@/src/components/user/useCurrentUser"
import { updateCurrentUserFn } from "@/src/server/users/users.functions"
import {
  updateUserFormDefaultValues,
  UpdateUserSchema,
  type UpdateUserType,
} from "@/src/shared/auth/schemas"

export const UserEditForm = () => {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const updateUserMutation = useMutation({ mutationFn: updateCurrentUserFn })
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      ...updateUserFormDefaultValues,
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      institution: user?.institution ?? null,
      phone: user?.phone ?? null,
    },
    validators: { onSubmit: UpdateUserSchema } as never,
    onSubmit: async ({ value }) => {
      try {
        await updateUserMutation.mutateAsync({ data: value as UpdateUserType })
        navigate({ to: "/dashboard" })
      } catch (error: unknown) {
        console.error(error)
        applyFormSubmitResult(
          form,
          {
            [FORM_ERROR]: error instanceof Error ? error.message : "Unbekannter Fehler",
          },
          setFormError,
        )
      }
    },
  })

  if (!user) return null

  return (
    <>
      <FormShell form={form} formError={formError} submitText="Speichern" className="max-w-prose">
        <form.AppField name="firstName">
          {(field) => <field.TextField label="Vorname" placeholder="" autoComplete="given-name" />}
        </form.AppField>
        <form.AppField name="lastName">
          {(field) => (
            <field.TextField label="Nachname" placeholder="" autoComplete="family-name" />
          )}
        </form.AppField>
        <form.AppField name="institution">
          {(field) => <field.TextField label="Organisation / Kommune" placeholder="" optional />}
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
