import { useQuery } from "@tanstack/react-query"
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
import {
  getUserSelectOptions,
  UserSelectOptions,
} from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { getBundeslandSelectOptions } from "@/src/server/alkis/alkisStateConfig"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
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
  backLink: ReactNode | null
  submitDisabled?: boolean
  submitClassName?: string
  users: UserSelectOptions
  // The project's editors; a new project has none, so its form has no Projektleitung.
  projectLeadOptions?: UserSelectOptions
}

export function ProjectForm<S extends z.ZodType>({
  initialValues,
  onSubmit,
  submitText,
  resetOnSubmit,
  className,
  actionBarLeft,
  actionBarRight,
  backLink,
  submitDisabled,
  submitClassName,
  schema,
  projectLeadOptions,
}: ProjectFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)
  const { data: user } = useQuery(currentUserQueryOptions())
  const userIsAdmin = isAdmin(user ?? null)

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

  // Admins set the Projektleitung; editors see it read-only.
  const projectLeadField = (readOnly: boolean) =>
    projectLeadOptions && (
      <form.AppField name="projectLeadId">
        {(field) => (
          <field.SelectField
            label="Projektleitung"
            optional
            disabled={readOnly}
            options={getUserSelectOptions(projectLeadOptions)}
            help={
              readOnly
                ? "Wird von Admins festgelegt."
                : "Zur Auswahl stehen Teammitglieder mit Bearbeitungsrechten."
            }
          />
        )}
      </form.AppField>
    )

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      className={twMerge(className)}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      backLink={backLink}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
      fieldLayout="labelsOnLeft"
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
      {!userIsAdmin && projectLeadField(true)}
      <SuperAdminBox>
        {projectLeadField(false)}
        <form.AppField name="partOf">
          {(field) => (
            <field.TextField
              type="text"
              label="Teilprojekt von"
              optional
              help="Wird auf der Karte „Meine Projekte“ klein neben der Trassenführung angezeigt."
            />
          )}
        </form.AppField>
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
