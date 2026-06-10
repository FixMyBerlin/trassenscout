import { ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { subsubsectionSpecialFormDefaultValues } from "@/src/shared/subsubsectionSpecial/schemas"

export type SubsubsectionSpecialFormProps<S extends z.ZodType> = {
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

export function SubsubsectionSpecialForm<S extends z.ZodType>({
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
}: SubsubsectionSpecialFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...subsubsectionSpecialFormDefaultValues, ...initialValues },
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
      className={twMerge("max-w-prose", className)}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
    >
      <form.AppField name="slug">
        {(field) => <field.TextField type="text" label="Kürzel" placeholder="" />}
      </form.AppField>
      <form.AppField name="title">
        {(field) => <field.TextField type="text" label="Titel" placeholder="" />}
      </form.AppField>
    </FormShell>
  )
}
