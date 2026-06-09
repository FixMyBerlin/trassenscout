"use client"

import { FormDirtyStateReporter } from "@/src/core/components/forms/FormDirtyStateReporter"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { linkStyles } from "@/src/core/components/links"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { commentFormDefaultValues } from "@/src/server/survey-response-comments/schemas"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { useSession } from "@blitzjs/auth"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import dompurify from "dompurify"
import { useState } from "react"

type Props = {
  comment:
    | NonNullable<
        Awaited<
          ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
        >["feedbackSurveyResponses"][number]["surveyResponseComments"][number]
      >
    | NonNullable<Awaited<ReturnType<typeof getProjectRecord>>["projectRecordComments"][number]>
  commentLabel: string
  mutateComment: {
    update: (body: string) => void
    remove: () => void
  }
}

export const EditCommentForm = ({ comment, commentLabel, mutateComment }: Props) => {
  const [open, setOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const session = useSession()

  const form = useAppForm({
    defaultValues: { ...commentFormDefaultValues, body: comment.body },
    onSubmit: async ({ value }) => {
      const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
      const body = sanitize(value.body)
      await mutateComment.update(body)
      setIsDirty(false)
      setOpen(false)
    },
  })

  const handleClose = () => {
    if (isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return
    setOpen(false)
  }

  const isAuthorOrAdmin = comment.author.id === session.userId || session.role === "ADMIN"
  if (!isAuthorOrAdmin) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx("flex items-center gap-2 hover:cursor-pointer", linkStyles)}
      >
        <PencilIcon className="size-3.5 shrink-0" />
        <p>bearbeiten</p>
      </button>

      <Modal open={open} handleClose={handleClose}>
        <HeadingWithAction className="mb-2">
          <H3>{commentLabel} bearbeiten</H3>
          <ModalCloseButton onClose={handleClose} />
        </HeadingWithAction>

        {open && (
          <FormShell
            key={comment.id}
            form={form}
            formError={null}
            submitText={`${commentLabel} speichern`}
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
        )}

        <button
          type="button"
          title={`${commentLabel} löschen`}
          onClick={async () => {
            if (
              window.confirm(`Sind Sie sicher, dass Sie diesen ${commentLabel} löschen möchten?`)
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
          className={clsx(
            "mt-4 flex w-full items-end justify-end gap-2 hover:cursor-pointer",
            linkStyles,
          )}
        >
          <p>{commentLabel} löschen</p>
          <TrashIcon className={clsx(linkStyles, "size-6")} />
        </button>
      </Modal>
    </>
  )
}
