import clsx from "clsx"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Prettify } from "src/core/types"
import { TFeedback, TFeedbackQuestion } from "src/survey-public/components/types"

import getFeedbackSurveyResponses from "src/survey-responses/queries/getFeedbackSurveyResponses"

export type EditableSurveyResponseUserTextProps = {
  feedbackQuestions: TFeedbackQuestion[]
  response: Prettify<Awaited<ReturnType<typeof getFeedbackSurveyResponses>>[number]>
  userTextIndices: Array<number>
}

const EditableSurveyResponseUserText: React.FC<EditableSurveyResponseUserTextProps> = ({
  response,
  feedbackQuestions,
  userTextIndices,
}) => {
  return (
    <div>
      {userTextIndices.map((userTextIndex) => {
        /* @ts-expect-error `data` is of type unkown */
        if (!response.data[userTextIndex]) return null
        return (
          <blockquote
            key={userTextIndex}
            className={clsx(userTextIndex % 2 === 0 ? "bg-yellow-100" : "bg-blue-50", "p-4 my-4")}
          >
            <h4 className="font-semibold mb-2">
              {feedbackQuestions.find((q) => q.id === userTextIndex)?.label.de}
            </h4>
            {/* @ts-expect-error `data` is of type unkown */}
            <Markdown markdown={response.data[userTextIndex]} />
          </blockquote>
        )
      })}
      <div className="mt-2 text-right text-gray-500">{`Bürgerbeitrag vom: ${response.surveySession.createdAt.toLocaleDateString()} um  ${response.surveySession.createdAt.toLocaleTimeString()}`}</div>
    </div>
  )
}

export default EditableSurveyResponseUserText
