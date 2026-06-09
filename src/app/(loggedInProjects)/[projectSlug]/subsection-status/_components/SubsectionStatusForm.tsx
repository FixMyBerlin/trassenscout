"use client"

import { subsectionStatusStyleTranslations } from "@/src/app/(loggedInProjects)/[projectSlug]/subsection-status/_utils/statusStyleTranslations"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { subsectionStatusFormDefaultValues } from "@/src/server/subsectionStatus/schema"
import { SubsectionStatusStyleEnum } from "@prisma/client"
import { ReactNode, useState } from "react"
import { z } from "zod"

export type SubsectionStatusFormProps<S extends z.ZodType<any, any>> = {
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

export function SubsectionStatusForm<S extends z.ZodType<any, any>>({
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
}: SubsectionStatusFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...subsectionStatusFormDefaultValues, ...initialValues },
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

  const styleItems = Object.entries(SubsectionStatusStyleEnum).map(([, value]) => ({
    value,
    label: subsectionStatusStyleTranslations[value],
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
      <form.AppField name="slug">
        {(field) => <field.TextField type="text" label="Kürzel" />}
      </form.AppField>
      <form.AppField name="title">
        {(field) => <field.TextField type="text" label="Titel" />}
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
