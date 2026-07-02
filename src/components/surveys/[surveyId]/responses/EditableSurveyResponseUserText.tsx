import { twJoin } from "tailwind-merge"
import { FieldConfig, SurveyPart2 } from "@/src/components/beteiligung/shared/types"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { Prettify } from "@/src/components/core/types"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"

type Props = {
  feedbackQuestions: SurveyPart2["pages"][number]["fields"][number][]
  response: Prettify<FeedbackSurveyResponse>
  userTextIndices: Array<string | undefined>
  surveyId: string
}

function responseText(data: Record<string, unknown>, key: string | undefined) {
  if (!key) return undefined
  const value = data[key]
  return typeof value === "string" ? value : value != null ? String(value) : undefined
}

function fieldLabel(field: FieldConfig | undefined) {
  if (!field || !("props" in field)) return undefined
  const props = field.props as { label?: string }
  return props.label
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
        {responseText(response.data, userTextIndices[0]) && (
          <blockquote className={twJoin("p-4", "bg-purple-100")}>
            <h4 className="mb-2 font-semibold">
              {fieldLabel(feedbackQuestions.find((q) => q.name === userTextIndices[0]))}
            </h4>
            <Markdown markdown={responseText(response.data, userTextIndices[0])!} />
          </blockquote>
        )}
        {responseText(response.data, userTextIndices[1]) && (
          <blockquote
            className={twJoin(
              "mt-4 p-4",
              responseText(response.data, userTextIndices[0]) &&
                responseText(response.data, userTextIndices[1])
                ? "bg-blue-50"
                : "bg-purple-100",
            )}
          >
            <h4 className="mb-2 font-semibold">
              {fieldLabel(feedbackQuestions.find((q) => q.name === userTextIndices[1]))}
            </h4>
            <Markdown markdown={responseText(response.data, userTextIndices[1])!} />
          </blockquote>
        )}
        <div className="mt-2 text-sm text-gray-500">
          Eingabe vom: {response.surveySession.createdAt.toLocaleDateString()} um{" "}
          {response.surveySession.createdAt.toLocaleTimeString("de-DE")}
        </div>
      </div>
    )

  return (
    <div>
      {userTextIndices.map((userTextIndex) => {
        const text = responseText(response.data, userTextIndex)
        if (!text) return null
        return (
          <div key={userTextIndex} className="bg-purple-100 p-4">
            <Markdown markdown={text} />
            <div className="mt-2 text-sm text-gray-500">
              Eingabe vom: {response.surveySession.createdAt.toLocaleDateString()} um{" "}
              {response.surveySession.createdAt.toLocaleTimeString("de-DE")}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default EditableSurveyResponseUserText
