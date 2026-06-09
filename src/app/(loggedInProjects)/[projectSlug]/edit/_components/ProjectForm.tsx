"use client"

import { UserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { getBundeslandSelectOptions } from "@/src/server/alkis/alkisStateConfig"
import { projectFormDefaultValues } from "@/src/server/projects/schema"
import { ReactNode, useState } from "react"
import { z } from "zod"

export type ProjectFormProps<S extends z.ZodType<any, any>> = {
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
  users: UserSelectOptions
}

export const ProjectForm = <S extends z.ZodType<any, any>>({
  users: _users,
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
}: ProjectFormProps<S>) => {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...projectFormDefaultValues, ...initialValues },
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
      <form.AppField name="slug">
        {(field) => (
          <field.TextField
            type="text"
            label="Kürzel"
            help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
          />
        )}
      </form.AppField>
      <form.AppField name="subTitle">
        {(field) => <field.TextField type="text" label="Untertitel" optional />}
      </form.AppField>
      <SuperAdminBox>
        <form.AppField name="alkisStateKey">
          {(field) => (
            <field.SelectField
              label="Bundesland (ALKIS-Daten)"
              optional
              // @ts-expect-error
              options={getBundeslandSelectOptions()}
            />
          )}
        </form.AppField>
      </SuperAdminBox>
      <form.AppField name="description">
        {(field) => <field.TextareaField label="Beschreibung (Markdown)" optional />}
      </form.AppField>
    </FormShell>
  )
}
