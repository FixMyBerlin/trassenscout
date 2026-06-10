import { clsx } from "clsx"
import dompurify from "dompurify"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { useIsHydrated } from "@/src/components/core/components/forms/hooks/useIsHydrated"
import { blueButtonStyles } from "@/src/components/core/components/links/styles"
import {
  CommentBodyFormSchema,
  commentBodyFormDefaultValues,
} from "@/src/shared/survey-response-comments/schemas"

type Props = {
  commentLabel: string
  commentHelp: string
  createComment: (body: string) => void
}

export const NewCommentForm = ({ commentLabel, commentHelp, createComment }: Props) => {
  const isHydrated = useIsHydrated()

  const form = useAppForm({
    defaultValues: commentBodyFormDefaultValues,
    validators: { onSubmit: CommentBodyFormSchema } as never,
    onSubmit: async ({ value }) => {
      const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
      await createComment(sanitize(value.body))
      form.reset()
    },
  })

  return (
    <FormShell
      form={form}
      formError={null}
      submitText={`${commentLabel} hinzufügen`}
      submitClassName={clsx(blueButtonStyles, "mt-2 px-3! py-2.5!")}
      submitDisabled={!isHydrated}
      className="space-y-0"
    >
      <form.AppField name="body">
        {(field) => (
          <field.TextareaField label="" help={commentHelp} disabled={!isHydrated} required />
        )}
      </form.AppField>
    </FormShell>
  )
}
