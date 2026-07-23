import { ReactNode, useState } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { TagsFormSection } from "@/src/components/tags/TagsFormSection"
import { contactFormDefaultValues } from "@/src/shared/contacts/schemas"

export type ContactFormProps<S extends z.ZodType> = {
  schema: S
  projectSlug: string
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
  layout?: "default" | "drawer"
}

export function ContactForm<S extends z.ZodType>({
  schema,
  projectSlug,
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
  layout = "default",
}: ContactFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)
  const isDrawerLayout = layout === "drawer"

  const form = useAppForm({
    defaultValues: { ...contactFormDefaultValues, ...initialValues },
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
      className={twMerge(isDrawerLayout ? "w-full max-w-5xl space-y-8" : "max-w-prose", className)}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      backLink={backLink}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
    >
      <div
        className={twJoin("grid gap-6", isDrawerLayout ? "lg:grid-cols-2 lg:gap-x-8" : undefined)}
      >
        <form.AppField name="firstName">
          {(field) => <field.TextField type="text" label="Vorname" optional placeholder="" />}
        </form.AppField>
        <form.AppField name="lastName">
          {(field) => <field.TextField type="text" label="Nachname" placeholder="" />}
        </form.AppField>
        <form.AppField name="email">
          {(field) => <field.TextField type="text" label="E-Mail-Adresse" placeholder="" />}
        </form.AppField>
        <form.AppField name="phone">
          {(field) => <field.TextField type="text" label="Telefonnummer" optional placeholder="" />}
        </form.AppField>
        <div className={isDrawerLayout ? "lg:col-span-2" : undefined}>
          <form.AppField name="role">
            {(field) => <field.TextField type="text" label="Position" optional placeholder="" />}
          </form.AppField>
        </div>
        <div className={isDrawerLayout ? "lg:col-span-2" : undefined}>
          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Notizen"
                optional
                placeholder=""
                rows={isDrawerLayout ? 5 : undefined}
              />
            )}
          </form.AppField>
        </div>
      </div>
      <TagsFormSection
        projectSlug={projectSlug}
        showManageLink
        classNameItemWrapper={
          isDrawerLayout ? "grid w-full gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3" : undefined
        }
      />
    </FormShell>
  )
}
