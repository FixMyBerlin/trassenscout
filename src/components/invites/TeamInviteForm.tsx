import { ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { membershipRoles } from "@/src/server/authorization/constants"
import { inviteFormDefaultValues } from "@/src/shared/invites/schemas"

export type TeamInviteFormProps<S extends z.ZodType> = {
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

export function TeamInviteForm<S extends z.ZodType>({
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
}: TeamInviteFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...inviteFormDefaultValues, ...initialValues },
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

  const roleItems = membershipRoles.map((role) => ({
    value: role,
    label: roleTranslation[role],
  }))

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
      <form.AppField name="email">
        {(field) => <field.TextField type="text" label="E-Mail-Adresse" placeholder="" />}
      </form.AppField>
      <form.AppField name="role">
        {(field) => <field.RadiobuttonGroup label="Rechte" items={roleItems} />}
      </form.AppField>
    </FormShell>
  )
}
