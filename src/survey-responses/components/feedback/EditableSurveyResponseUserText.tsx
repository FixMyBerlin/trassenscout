import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { Prettify } from "@/src/core/types"
import { TFeedbackQuestion } from "@/src/survey-public/components/types"
import getFeedbackSurveyResponses from "@/src/survey-responses/queries/getFeedbackSurveyResponses"
import { clsx } from "clsx"

type Props = {
  feedbackQuestions: TFeedbackQuestion[]
  response: Prettify<Awaited<ReturnType<typeof getFeedbackSurveyResponses>>[number]>
  userTextIndices: Array<number | undefined>
  surveyId: string
}

const EditableSurveyResponseUserText = ({
  response,
  feedbackQuestions,
  userTextIndices,
  surveyId,
}: Props) => {
  // this is only used for RS8 survey responses
  // wegen des Bugs (nur einer der Texte wurde angezeigt) sollen hier alle vor dem Bugfix nicht angezeigten Texte blau hinterlegt werden
  // if (surveyId === "1") {... sollte gelöscht werden wenn der Bug keine Rolle mehr spielt
  if (surveyId === "1")
    return (
      <div>
        {/* @ts-expect-error `data` is of type unkown */}
        {response.data[userTextIndices[0]] && (
          <blockquote className={clsx("p-4", "bg-purple-100")}>
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
              "mt-4 p-4",
              //  @ts-expect-error `data` is of type unkown
              response.data[userTextIndices[0]] && response.data[userTextIndices[1]]
                ? "bg-blue-50"
                : "bg-purple-100",
            )}
          >
            <h4 className="mb-2 font-semibold">
              {feedbackQuestions.find((q) => q.id === userTextIndices[1])?.label.de}
            </h4>
            {/* @ts-expect-error `data` is of type unkown */}
            <Markdown markdown={response.data[userTextIndices[1]]} />
          </blockquote>
        )}
        <div className="mt-2 text-sm text-gray-500">
          Bürger:innenbeitrag vom: {response.surveySession.createdAt.toLocaleDateString()} um{" "}
          {response.surveySession.createdAt.toLocaleTimeString("de-DE")}
        </div>
      </div>
    )
  return (
    <div>
      {userTextIndices.map((userTextIndex) => {
        /* @ts-expect-error `data` is of type unkown */
        if (!response.data[userTextIndex]) return null
        return (
          <div key={userTextIndex} className="bg-purple-100 p-4">
            {/* @ts-expect-error `data` is of type unkown */}
            <Markdown markdown={response.data[userTextIndex]} />
            <div className="mt-2 text-sm text-gray-500">
              Bürger:innenbeitrag vom: {response.surveySession.createdAt.toLocaleDateString()} um{" "}
              {response.surveySession.createdAt.toLocaleTimeString("de-DE")}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default EditableSurveyResponseUserText
