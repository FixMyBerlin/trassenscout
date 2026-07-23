import { ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { subsubsectionStatusStyleTranslations } from "@/src/components/subsection-status/statusStyleTranslations"
import { SubsubsectionStatusStyleEnum } from "@/src/prisma/generated/browser"
import { subsubsectionStatusFormDefaultValues } from "@/src/shared/subsubsectionStatus/schemas"

export type SubsubsectionStatusFormProps<S extends z.ZodType> = {
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
}

export function SubsubsectionStatusForm<S extends z.ZodType>({
  schema,
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
}: SubsubsectionStatusFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...subsubsectionStatusFormDefaultValues, ...initialValues },
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

  const styleItems = Object.entries(SubsubsectionStatusStyleEnum).map(([, value]) => ({
    value,
    label: subsubsectionStatusStyleTranslations[value],
  }))

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      className={twMerge("max-w-prose", className)}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      backLink={backLink}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
    >
      <form.AppField name="slug">
        {(field) => <field.TextField type="text" label="Kürzel" placeholder="" />}
      </form.AppField>
      <form.AppField name="title">
        {(field) => <field.TextField type="text" label="Titel" placeholder="" />}
      </form.AppField>
      <form.AppField name="style">
        {(field) => (
          <field.RadiobuttonGroup
            label="Darstellung"
            items={styleItems}
            classNameItemWrapper="flex gap-5 space-y-0! items-center"
          />
        )}
      </form.AppField>
    </FormShell>
  )
}
