import { blueButtonStyles } from "@/src/core/components/links"
import { Spinner } from "@/src/core/components/Spinner"
import createSurveyResponseComment from "@/src/survey-response-comments/mutations/createSurveyResponseComment"
import { useMutation } from "@blitzjs/rpc"
import dompurify from "dompurify"
import { useRef } from "react"

type Props = { surveyResponseId: number }

export const NewSurveyResponseCommentForm = ({ surveyResponseId }: Props) => {
  const [createSurveyResponseCommentMutation, { isLoading, error }] = useMutation(
    createSurveyResponseComment,
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
    createSurveyResponseCommentMutation(
      {
        projectSlug: "radnetz-bb",
        surveyResponseId,
        body: sanitize(new FormData(event.currentTarget).get("body")!.toString()),
      },
      {
        onSuccess: () => {
          // NOTE: Remove once we update to the newest react-compiler-esling-package that fixed this false positive https://github.com/facebook/react/issues/29703#issuecomment-2166763791
          // eslint-disable-next-line react-compiler/react-compiler
          textareaRef.current!.value = ""
          // todo replace query and uncomment these lines
          // const queryKey = getQueryKey(getNoteAndComments, { id: surveyResponseId })
          // getQueryClient().invalidateQueries(queryKey)
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <span className="sr-only">Antwort (Markdown)</span>
        <textarea
          ref={textareaRef}
          name="body"
          className="block min-h-28 w-full rounded-md border-0 bg-gray-50 py-2 leading-tight text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600"
          data-1p-ignore
          data-lpignore
        />
      </label>

      <div className="mt-3 flex items-center gap-1 leading-tight">
        <button type="submit" className={blueButtonStyles} disabled={isLoading}>
          Antwort speichern
        </button>
        {isLoading && <Spinner />}
      </div>

      {/* @ts-expect-errors TODO Research how the error message is provided by Blitz */}
      {error ? <p className="text-red-500">{error.message}</p> : null}
    </form>
  )
}
