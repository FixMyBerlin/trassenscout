"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { blueButtonStyles } from "@/src/core/components/links"
import { commentFormDefaultValues } from "@/src/server/survey-response-comments/schemas"
import { clsx } from "clsx"
import dompurify from "dompurify"

type Props = {
  commentLabel: string
  commentHelp: string
  createComment: (body: string) => void
}

export const NewCommentForm = ({ commentLabel, commentHelp, createComment }: Props) => {
  const form = useAppForm({
    defaultValues: commentFormDefaultValues,
    onSubmit: async ({ value }) => {
      const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
      const body = sanitize(value.body)
      await createComment(body)
      form.reset()
    },
  })

  return (
    <FormShell form={form} formError={null} submitText="" hideSubmitButton className="space-y-2">
      <form.AppField name="body">
        {(field) => (
          <field.TextareaField label="" help={commentHelp} required rows={4} className="h-24" />
        )}
      </form.AppField>
      <button type="submit" className={clsx(blueButtonStyles, "mt-2 px-3! py-2.5!")}>
        {commentLabel} hinzufügen
      </button>
    </FormShell>
  )
}
