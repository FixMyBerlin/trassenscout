import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import dompurify from "dompurify"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormDirtyStateReporter } from "@/src/components/core/components/forms/FormDirtyStateReporter"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { useCurrentUser } from "@/src/components/user/useCurrentUser"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import {
  CommentBodyFormSchema,
  commentBodyFormDefaultValues,
} from "@/src/shared/survey-response-comments/schemas"

type Props = {
  comment:
    | NonNullable<FeedbackSurveyResponse["surveyResponseComments"][number]>
    | NonNullable<ProjectRecord["projectRecordComments"][number]>
  commentLabel: string
  mutateComment: {
    update: (body: string) => void
    remove: () => void
  }
}

export const EditCommentForm = ({ comment, commentLabel, mutateComment }: Props) => {
  const [open, setOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const user = useCurrentUser()
  const userCanEditProject = useUserCan().edit

  const form = useAppForm({
    defaultValues: { ...commentBodyFormDefaultValues, body: comment.body ?? "" },
    validators: { onSubmit: CommentBodyFormSchema } as never,
    onSubmit: async ({ value }) => {
      const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
      const body = sanitize(value.body)
      const result: OnSubmitResult = {}
      try {
        await mutateComment.update(body)
        setIsDirty(false)
        setOpen(false)
      } catch (error: unknown) {
        result.FORM_ERROR = String(error)
      }
      applyFormSubmitResult(form, result, setFormError)
    },
  })

  const handleClose = () => {
    if (isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return
    setOpen(false)
  }

  const isAdmin = user?.role === "ADMIN"
  const isAuthor = comment.author.id === user?.id
  const canUpdateComment = userCanEditProject || isAuthor || isAdmin
  const canRemoveComment = userCanEditProject || isAdmin

  if (!canUpdateComment) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={twJoin("flex items-center gap-2 hover:cursor-pointer", linkStyles)}
      >
        <PencilIcon className="size-3.5 shrink-0" />
        <p>bearbeiten</p>
      </button>

      <Modal open={open} handleClose={handleClose}>
        <PageHeader
          title={`${commentLabel} bearbeiten`}
          action={<ModalCloseButton onClose={handleClose} />}
        />

        <FormShell
          form={form}
          formError={formError}
          submitText={`${commentLabel} speichern`}
          className="space-y-0"
          actionBarRight={
            canRemoveComment ? (
              <button
                type="button"
                title={`${commentLabel} löschen`}
                onClick={async () => {
                  if (
                    window.confirm(
                      `Sind Sie sicher, dass Sie diesen ${commentLabel} löschen möchten?`,
                    )
                  ) {
                    try {
                      setIsDirty(false)
                      setOpen(false)
                      await mutateComment.remove()
                    } catch (error: unknown) {
                      window.alert(String(error))
                      console.error(error)
                    }
                  }
                }}
                className={primaryButtonClassName}
              >
                <TrashIcon className="size-5" />
              </button>
            ) : undefined
          }
          backLink={null}
        >
          <FormDirtyStateReporter onDirtyChange={setIsDirty} />
          <form.AppField name="body">
            {(field) => (
              <field.TextareaField
                className="min-h-40"
                label=""
                data-1p-ignore
                data-lpignore
                required
              />
            )}
          </form.AppField>
        </FormShell>
      </Modal>
    </>
  )
}
