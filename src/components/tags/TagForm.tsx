import { ReactNode, useState } from "react"
import { z } from "zod"
import { FieldLayout } from "@/src/components/core/components/forms/FieldLayout"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import { TagColorEnum } from "@/src/prisma/generated/browser"
import { TagColorField } from "./TagColorField"

const tagFormSchema = z.object({
  title: z.string().trim().min(1, { error: "Pflichtfeld." }),
  description: z.string().trim().nullable(),
  color: z.enum(TagColorEnum).optional(),
})

export type TagFormValues = z.infer<typeof tagFormSchema>

export type TagFormProps = {
  initialValues?: Partial<TagFormValues>
  onSubmit: (values: TagFormValues) => Promise<void | OnSubmitResult>
  submitText: string
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  backLink: ReactNode | null
  submitDisabled?: boolean
  submitClassName?: string
  submitPlacement?: "left" | "right"
  actionBarClassName?: string
  titleLabel?: string
  withDescription?: boolean
  withColor?: boolean
}

export function TagForm({
  initialValues,
  onSubmit,
  submitText,
  className,
  actionBarLeft,
  actionBarRight,
  backLink,
  submitDisabled,
  submitClassName,
  submitPlacement,
  actionBarClassName,
  titleLabel = "Titel",
  withDescription = false,
  withColor = false,
}: TagFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { title: "", description: null, ...initialValues },
    validators: { onSubmit: tagFormSchema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value as TagFormValues)) || {}
      applyFormSubmitResult(form, result, setFormError)
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
      backLink={backLink}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
      submitPlacement={submitPlacement}
      actionBarClassName={actionBarClassName}
      fieldLayout={backLink ? "labelsOnLeft" : "stacked"}
    >
      <form.AppField name="title">
        {(field) => <field.TextField type="text" label={titleLabel} placeholder="" />}
      </form.AppField>
      {withDescription && (
        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              label="Beschreibung"
              optional
              placeholder="Optionale Beschreibung für die Nutzung dieses Tags"
              rows={4}
            />
          )}
        </form.AppField>
      )}
      {withColor && (
        <>
          <form.AppField name="color">{() => <TagColorField />}</form.AppField>
          <form.Subscribe selector={(state) => [state.values.title, state.values.color] as const}>
            {([title, color]) => (
              <FieldLayout label="Vorschau">
                <ProjectRecordTagsList tags={[{ id: 0, title: title.trim() || "Tag", color }]} />
              </FieldLayout>
            )}
          </form.Subscribe>
        </>
      )}
    </FormShell>
  )
}
