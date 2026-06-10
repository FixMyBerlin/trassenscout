import { ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import type { ProjectsAdmin } from "@/src/server/projects/types"
import { projectRecordEmailFormDefaultValues } from "@/src/shared/projectRecordEmails/schemas"

export type ProjectRecordEmailFormProps<S extends z.ZodType> = {
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
  projects: ProjectsAdmin["projects"]
}

export function ProjectRecordEmailForm<S extends z.ZodType>({
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
      className={twMerge("grow", className)}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
    >
      <div className="space-y-6">
        <form.AppField name="text">
          {(field) => (
            <field.TextareaField label="Body" rows={15} placeholder="E-Mail-Inhalt einfügen..." />
          )}
        </form.AppField>
        <form.AppField name="projectId">
          {(field) => <field.SelectField optional options={projectOptions} label="Projekt" />}
        </form.AppField>
      </div>
    </FormShell>
  )
}
