import { blueButtonStyles } from "@/src/core/components/links"
import { useTryProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import createSurveyResponseComment from "@/src/survey-response-comments/mutations/createSurveyResponseComment"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import dompurify from "dompurify"
import { useState } from "react"
import { LabeledTextarea } from "../form/LabeledTextarea"

type Props = { surveyResponseId: number }

export const NewSurveyResponseCommentForm = ({ surveyResponseId }: Props) => {
  const [createSurveyResponseCommentMutation, { error }] = useMutation(createSurveyResponseComment)
  const projectSlug = useTryProjectSlug()

  const [body, setBody] = useState("")

  // todo any
  const handleSubmit = async (event: any) => {
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
      <LabeledTextarea
        onChange={handleTextareaChange}
        value={body}
        required
        name="body"
        help="Dieser Kommentar wird extern nicht sichtbar sein."
      />
      <button className={clsx(blueButtonStyles, "mt-2 !px-3 !py-2.5")} type="submit">
        Kommentar hinzufügen
      </button>
    </form>
  )
}
