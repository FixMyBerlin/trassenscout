import { ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { UserSelectOptions } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { getBundeslandSelectOptions } from "@/src/server/alkis/alkisStateConfig"
import { projectFormDefaultValues } from "@/src/shared/projects/schemas"

export type ProjectFormProps<S extends z.ZodType> = {
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
  users: UserSelectOptions
}

export function ProjectForm<S extends z.ZodType>({
  initialValues,
  onSubmit,
  submitText,
  resetOnSubmit,
  className,
  actionBarLeft,
  actionBarRight,
  submitDisabled,
  submitClassName,
  schema,
}: ProjectFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...projectFormDefaultValues, ...initialValues },
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
      className={twMerge(className)}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
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
              options={getBundeslandSelectOptions().map(([key, label]) => [key, label])}
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
