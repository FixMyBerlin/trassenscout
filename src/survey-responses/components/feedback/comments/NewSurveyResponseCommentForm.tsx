import { blueButtonStyles } from "@/src/core/components/links"
import { useTryProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import createSurveyResponseComment from "@/src/survey-response-comments/mutations/createSurveyResponseComment"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import dompurify from "dompurify"
import { useState } from "react"

type Props = { surveyResponseId: number }

export const NewSurveyResponseCommentForm = ({ surveyResponseId }: Props) => {
  const [createSurveyResponseCommentMutation, { error }] = useMutation(createSurveyResponseComment)
  const projectSlug = useTryProjectSlug()

  const [body, setBody] = useState("")

  // @ts-expect-error todo
  const handleSubmit = async (event) => {
    event.preventDefault()
    const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
    createSurveyResponseCommentMutation(
      {
        projectSlug: projectSlug!,
        surveyResponseId,
        body: sanitize(event.target.body.value),
      },
      {
        onSuccess: () => {
          setBody("")
          invalidateQuery(getFeedbackSurveyResponsesWithSurveyDataAndComments)
        },
      },
    )
  }
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        onChange={handleTextareaChange}
        value={body}
        required
        name="body"
        className={
          "block h-24 w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        }
      />
      <div className="mt-2 text-gray-500"> Dieser Kommentar wird extern nicht sichtbar sein.</div>

      <button className={clsx(blueButtonStyles, "mt-2 !px-3 !py-2.5")} type="submit">
        Kommentar hinzufügen
      </button>
    </form>
  )
}
