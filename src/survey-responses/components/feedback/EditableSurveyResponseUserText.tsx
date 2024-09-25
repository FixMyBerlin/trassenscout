import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { Prettify } from "@/src/core/types"
import { TFeedbackQuestion } from "@/src/survey-public/components/types"
import getFeedbackSurveyResponses from "@/src/survey-responses/queries/getFeedbackSurveyResponses"
import { clsx } from "clsx"

export type EditableSurveyResponseUserTextProps = {
  feedbackQuestions: TFeedbackQuestion[]
  response: Prettify<Awaited<ReturnType<typeof getFeedbackSurveyResponses>>[number]>
  userTextIndices: Array<number | undefined>
  surveyId: string
}

const EditableSurveyResponseUserText: React.FC<EditableSurveyResponseUserTextProps> = ({
  response,
  feedbackQuestions,
  userTextIndices,
  surveyId,
}) => {
  // this is only used for RS8 survey responses
  // wegen des Bugs (nur einer der Texte wurde angezeigt) sollen hier alle vor dem Bugfix nicht angezeigten Texte blau hinterlegt werden
  // if (surveyId === "1") {... sollte gelöscht werden wenn der Bug keine Rolle mehr spielt
  if (surveyId === "1")
    return (
      <div>
        {/* @ts-expect-error `data` is of type unkown */}
        {response.data[userTextIndices[0]] && (
          <blockquote className={clsx("my-4 p-4", "bg-yellow-100")}>
            <h4 className="mb-2 font-semibold">
              {feedbackQuestions.find((q) => q.id === userTextIndices[0])?.label.de}
            </h4>
            {/* @ts-expect-error `data` is of type unkown */}
            <Markdown markdown={response.data[userTextIndices[0]]} />
          </blockquote>
        )}
        {/* @ts-expect-error `data` is of type unkown */}
        {response.data[userTextIndices[1]] && (
          <blockquote
            className={clsx(
              "my-4 p-4",
              //  @ts-expect-error `data` is of type unkown
              response.data[userTextIndices[0]] && response.data[userTextIndices[1]]
                ? "bg-blue-50"
                : "bg-yellow-100",
            )}
          >
            <h4 className="mb-2 font-semibold">
              {feedbackQuestions.find((q) => q.id === userTextIndices[1])?.label.de}
            </h4>
            {/* @ts-expect-error `data` is of type unkown */}
            <Markdown markdown={response.data[userTextIndices[1]]} />
          </blockquote>
        )}
        <div className="mt-2 text-right text-gray-500">{`Bürgerbeitrag vom: ${response.surveySession.createdAt.toLocaleDateString()} um  ${response.surveySession.createdAt.toLocaleTimeString()}`}</div>
      </div>
    )
  return (
    <div>
      {userTextIndices.map((userTextIndex) => {
        /* @ts-expect-error `data` is of type unkown */
        if (!response.data[userTextIndex]) return null
        return (
          <blockquote key={userTextIndex} className="my-4 bg-yellow-100 p-4">
            <h4 className="mb-2 font-semibold">
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
