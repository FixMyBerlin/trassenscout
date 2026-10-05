import dompurify from "dompurify"
import { twJoin } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { useIsHydrated } from "@/src/components/core/components/forms/hooks/useIsHydrated"
import { revealSmoothly } from "@/src/components/core/utils/revealSmoothly"
import {
  CommentBodyFormSchema,
  commentBodyFormDefaultValues,
} from "@/src/shared/survey-response-comments/schemas"

type Props = {
  commentLabel: string
  createComment: (body: string) => void
}

const revealWhenShown = (node: HTMLDivElement | null) => (node ? revealSmoothly(node) : undefined)

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
    <form.Subscribe selector={(state) => state.values.body.trim() !== ""}>
      {(hasBody) => (
        <>
          <FormShell
            form={form}
            formError={null}
            submitText={`${commentLabel} hinzufügen`}
            submitClassName={twJoin(primaryButtonClassName, "px-3!")}
            submitDisabled={!isHydrated}
            hideSubmitButton={!hasBody}
            className="p-0"
            actionBarClassName="border-0 bg-transparent px-0"
            backLink={null}
          >
            <form.AppField name="body">
              {(field) => <field.TextareaField label="" disabled={!isHydrated} required />}
            </form.AppField>
          </FormShell>
          {hasBody && <div ref={revealWhenShown} />}
        </>
      )}
    </form.Subscribe>
  )
}
