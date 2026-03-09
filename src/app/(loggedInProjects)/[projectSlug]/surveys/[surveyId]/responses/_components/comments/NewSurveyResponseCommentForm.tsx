import { blueButtonStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import createSurveyResponseComment from "@/src/server/survey-response-comments/mutations/createSurveyResponseComment"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { clsx } from "clsx"
import dompurify from "dompurify"
import { useState } from "react"
import { LabeledTextarea } from "../form/LabeledTextarea"

type Props = { surveyResponseId: number; commentLabel: string; commentHelp: string }

export const NewSurveyResponseCommentForm = ({
  surveyResponseId,
  commentLabel,
  commentHelp,
}: Props) => {
  const [createSurveyResponseCommentMutation, { error }] = useMutation(createSurveyResponseComment)
  const projectSlug = useProjectSlug()

  const [body, setBody] = useState("")

  // todo any
  const handleSubmit = async (event: any) => {
    event.preventDefault()
    const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
    createSurveyResponseCommentMutation(
      {
        projectSlug: projectSlug,
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
        help={commentHelp}
      />
      <button className={clsx(blueButtonStyles, "mt-2 px-3! py-2.5!")} type="submit">
        {commentLabel} hinzufügen
      </button>
    </form>
  )
}
