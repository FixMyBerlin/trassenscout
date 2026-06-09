"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { projectRecordEmailFormDefaultValues } from "@/src/server/ProjectRecordEmails/schema"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import { ReactNode, useState } from "react"
import { z } from "zod"

export type ProjectRecordEmailFormProps<S extends z.ZodType<any, any>> = {
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
  projects: TGetProjects["projects"]
}

export function ProjectRecordEmailForm<S extends z.ZodType<any, any>>({
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
  projects,
}: ProjectRecordEmailFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const projectOptions: [string | number, string][] = [
    ["", "Kein Projekt"],
    ...projects.map((project) => [String(project.id), project.slug] as [string, string]),
  ]

  const form = useAppForm({
    defaultValues: { ...projectRecordEmailFormDefaultValues, ...initialValues },
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
      <form.AppField name="text">
        {(field) => (
          <field.TextareaField label="Body" rows={15} placeholder="E-Mail-Inhalt einfügen..." />
        )}
      </form.AppField>
      <form.AppField name="projectId">
        {(field) => <field.SelectField optional options={projectOptions} label="Projekt" />}
      </form.AppField>
    </FormShell>
  )
}
