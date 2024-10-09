import { useMutation } from "@blitzjs/rpc"
import { PencilSquareIcon } from "@heroicons/react/20/solid"
import dompurify from "dompurify"
import { useState } from "react"

import { blueButtonStyles } from "@/src/core/components/links"
import { ModalDialog } from "@/src/core/components/Modal/ModalDialog"
import { Spinner } from "@/src/core/components/Spinner"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import updateSurveyResponseComment from "@/src/survey-response-comments/mutations/updateSurveyResponseComment"
import { SurveyResponseComment } from "@prisma/client"
import { useIsAuthor } from "./utils/useIsAuthor"

type Props = { comment: SurveyResponseComment }

export const EditSurveyResponseCommentForm = ({ comment }: Props) => {
  const projectSlug = useProjectSlug()
  const [updateSurveyResponseCommentMutation, { isLoading, error }] = useMutation(
    updateSurveyResponseComment,
  )
  // todo
  // const [deleteNoteCommentMutation] = useMutation(deleteNoteComment)
  const [open, setOpen] = useState(false)

  // todo
  // Keys to ping the queries to rerun
  // const queryKeyInspector = getQueryKey(getFeedbackSurveyResponsesWithSurveyDataAndComments, {
  //   id: comment.surveyResponseId,
  // })
  // const queryKeyMap = useQueryKey()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
    updateSurveyResponseCommentMutation(
      {
        projectSlug: projectSlug,
        commentId: comment.id,
        body: sanitize(new FormData(event.currentTarget).get("body")!.toString()),
      },
      {
        onSuccess: () => {
          // todo
          // getQueryClient().invalidateQueries(queryKeyInspector)
          // getQueryClient().invalidateQueries(queryKeyMap)
          // setOpen(false)
        },
      },
    )
  }

  const isAuthor = useIsAuthor(comment.author.id)
  if (!isAuthor) {
    return null
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={blueButtonStyles}>
        <PencilSquareIcon className="size-6" />
      </button>

      <ModalDialog
        title="Antwort bearbeiten"
        icon="edit"
        buttonCloseName="Abbrechen"
        open={open}
        setOpen={setOpen}
      >
        <form onSubmit={handleSubmit}>
          <label>
            <span className="sr-only">Antwort bearbeiten (Markdown)</span>
            <textarea
              name="body"
              className="my-3 block min-h-28 w-full rounded-md border-0 bg-gray-50 py-2 leading-tight text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600"
              data-1p-ignore
              data-lpignore
              defaultValue={comment.body}
              required
            />
          </label>

          <div className="mt-6 flex items-center justify-between leading-tight">
            <div className="flex items-center gap-1">
              <button type="submit" className={blueButtonStyles} disabled={isLoading}>
                Änderung speichern
              </button>
              {isLoading && <Spinner />}
            </div>
            {/* todo */}
            {/* <button
              type="button"
              title="Kommentar löschen"
              onClick={async () => {
                if (window.confirm("Sind Sie sicher, dass Sie diesen Kommentar löschen möchten?")) {
                  try {
                    setOpen(false)
                    await deleteNoteCommentMutation({
                      regionSlug: region!.slug,
                      commentId: comment.id,
                    })
                    getQueryClient().invalidateQueries(queryKeyInspector)
                    getQueryClient().invalidateQueries(queryKeyMap)
                  } catch (error: any) {
                    window.alert(error.toString())
                    console.error(error)
                  }
                }
              }}
              className={twMerge(notesButtonStyle, "hover:bg-orange-400")}
            >
              <TrashIcon className="size-6" />
            </button> */}
          </div>

          {/* @ts-expect-errors TODO Research how the error message is provided by Blitz */}
          {error ? <p className="text-red-500">{error.message}</p> : null}
        </form>
      </ModalDialog>
    </>
  )
}
