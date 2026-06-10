import { useSuspenseQuery } from "@tanstack/react-query"
import { ReactNode, useState } from "react"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { getUserSelectOptions } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { membershipRoles } from "@/src/server/authorization/constants"
import { getProjectSelectOptions } from "@/src/server/authorization/getProjectSelectOptions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { usersAdminQueryOptions } from "@/src/server/users/usersQueryOptions"
import { membershipFormDefaultValues } from "@/src/shared/memberships/schemas"

export type MembershipFormProps<S extends z.ZodType> = {
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
}

export function MembershipForm<S extends z.ZodType>({
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
}: MembershipFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)
  const { data: usersResult } = useSuspenseQuery(usersAdminQueryOptions())
  const { data: projectsResult } = useSuspenseQuery(projectsAdminQueryOptions())

  const form = useAppForm({
    defaultValues: { ...membershipFormDefaultValues, ...initialValues },
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

  const roleItems = membershipRoles.map((role) => ({
    value: role,
    label: roleTranslation[role],
  }))

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
    >
      <form.AppField name="userId">
        {(field) => (
          <field.SelectField label="User" options={getUserSelectOptions(usersResult.users)} />
        )}
      </form.AppField>
      <form.AppField name="role">
        {(field) => <field.RadiobuttonGroup label="Rechte" items={roleItems} />}
      </form.AppField>
      <form.AppField name="projectId">
        {(field) => (
          <field.SelectField
            label="Projekt, auf dem User Rechte erhalten soll"
            options={getProjectSelectOptions(projectsResult.projects)}
          />
        )}
      </form.AppField>
    </FormShell>
  )
}
