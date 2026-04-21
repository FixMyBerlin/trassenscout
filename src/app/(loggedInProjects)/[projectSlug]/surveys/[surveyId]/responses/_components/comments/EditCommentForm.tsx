import { Form, LabeledTextareaField } from "@/src/core/components/forms"
import { linkStyles } from "@/src/core/components/links"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
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
  const session = useSession()

  const handleSubmit = async (values: { body: string }) => {
    const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
    const body = sanitize(values.body)
    await mutateComment.update(body)
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

      <Modal open={open} handleClose={() => setOpen(false)}>
        <HeadingWithAction className="mb-2">
          <H3>{commentLabel} bearbeiten</H3>
          <ModalCloseButton onClose={() => setOpen(false)} />
        </HeadingWithAction>

        <Form onSubmit={handleSubmit} submitText={`${commentLabel} speichern`}>
          <LabeledTextareaField
            name="body"
            className="min-h-40"
            label=""
            data-1p-ignore
            data-lpignore
            defaultValue={comment.body}
            required
          />
        </Form>

        <button
          type="button"
          title={`${commentLabel} löschen`}
          onClick={async () => {
            if (
              window.confirm(`Sind Sie sicher, dass Sie diesen ${commentLabel} löschen möchten?`)
            ) {
              try {
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
