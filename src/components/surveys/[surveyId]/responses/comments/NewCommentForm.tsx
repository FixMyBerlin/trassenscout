import dompurify from "dompurify"
import { twJoin } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { useIsHydrated } from "@/src/components/core/components/forms/hooks/useIsHydrated"
import {
  CommentBodyFormSchema,
  commentBodyFormDefaultValues,
} from "@/src/shared/survey-response-comments/schemas"

type Props = {
  commentLabel: string
  createComment: (body: string) => void
}

export const NewCommentForm = ({ commentLabel, createComment }: Props) => {
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
      submitClassName={twJoin(primaryButtonClassName, "px-3!")}
      submitDisabled={!isHydrated}
      className="p-0"
      actionBarClassName="border-0 bg-transparent px-0"
      backLink={null}
    >
      <form.AppField name="body">
        {(field) => <field.TextareaField label="" disabled={!isHydrated} required />}
      </form.AppField>
    </FormShell>
  )
}
