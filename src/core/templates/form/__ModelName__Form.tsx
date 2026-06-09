"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { ReactNode, useState } from "react"
import { z } from "zod"

export type __ModelName__FormProps<S extends z.ZodType<any, any>> = {
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

export function __ModelName__Form<S extends z.ZodType<any, any>>({
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
}: __ModelName__FormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: initialValues ?? {},
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
      {/*
        <form.AppField name="name">
          {(field) => <field.TextField type="text" label="Name" placeholder="Name" />}
        </form.AppField>

        <form.AppField name="testTextarea">
          {(field) => (
            <field.TextareaField label="Test Textarea" placeholder="Placeholder" />
          )}
        </form.AppField>

        <form.AppField name="checkboxScope">
          {(field) => (
            <field.CheckboxGroup
              label="Test Checkbox Group"
              items={["item1", "item2", "item3"].map((item) => ({
                name: `checkbox${item}help`,
                label: `Test Checkbox ${item}`,
                help: `Help text ${item}`,
              }))}
            />
          )}
        </form.AppField>

        <form.AppField name="help">
          {(field) => (
            <field.RadiobuttonGroup
              label="Test Radiobutton Group"
              items={["item1", "item2", "item3"].map((item) => ({
                value: `radio${item}help`,
                label: `Test Radiobutton ${item}`,
              }))}
            />
          )}
        </form.AppField>

        <form.AppField name="testSelect">
          {(field) => (
            <field.SelectField
              label="Test Select"
              options={[
                ["foo", "Foo 1"],
                ["bar", "Bar 1"],
              ]}
            />
          )}
        </form.AppField>
      */}
    </FormShell>
  )
}
