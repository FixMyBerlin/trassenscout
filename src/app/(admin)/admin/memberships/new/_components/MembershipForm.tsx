"use client"

import { getProjectSelectOptions } from "@/src/app/(loggedInProjects)/_utils/getProjectSelectOptions"
import { roleTranslation } from "@/src/app/_components/memberships/roleTranslation.const"
import { getUserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import { membershipRoles } from "@/src/authorization/constants"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { membershipFormDefaultValues } from "@/src/server/memberships/schema"
import getProjects from "@/src/server/projects/queries/getProjects"
import getUsers from "@/src/server/users/queries/getUsers"
import { useQuery } from "@blitzjs/rpc"
import { ReactNode, useState } from "react"
import { z } from "zod"

export type MembershipFormProps<S extends z.ZodType<any, any>> = {
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

export function MembershipForm<S extends z.ZodType<any, any>>({
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
}: MembershipFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)
  const [{ users }] = useQuery(getUsers, {})
  const [{ projects }] = useQuery(getProjects, {})

  const form = useAppForm({
    defaultValues: { ...membershipFormDefaultValues, ...initialValues },
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
      showFormDebug={showFormDebug}
    >
      <form.AppField name="userId">
        {(field) => <field.SelectField label="User" options={getUserSelectOptions(users)} />}
      </form.AppField>
      <form.AppField name="role">
        {(field) => <field.RadiobuttonGroup label="Rechte" items={roleItems} />}
      </form.AppField>
      <form.AppField name="projectId">
        {(field) => (
          <field.SelectField
            label="Projekt, auf dem User Rechte erhalten soll"
            options={getProjectSelectOptions(projects)}
          />
        )}
      </form.AppField>
    </FormShell>
  )
}
