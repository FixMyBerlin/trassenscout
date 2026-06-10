import { useSuspenseQuery } from "@tanstack/react-query"
import type { SurveyPart1and3, SurveyPart2 } from "@/src/components/beteiligung/shared/types"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { SurveyResponseFieldValue } from "@/src/components/beteiligung/shared/utils/SurveyResponseFieldValue"
import { surveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"

type Props = {
  projectSlug: string
  surveyId: number
  survey: { slug: AllowedSurveySlugs }
}

export const AdminSurveyResponsesNew = ({ projectSlug, surveyId, survey }: Props) => {
  const { data: allSurveyResponses } = useSuspenseQuery(
    surveyResponsesQueryOptions({ projectSlug, surveyId }),
  )

  const part1 = getConfigBySurveySlug(survey.slug, "part1")
  const part2 = getConfigBySurveySlug(survey.slug, "part2")
  const part3 = getConfigBySurveySlug(survey.slug, "part3")

  return (
    <>
      {[
        { config: part1, partNumber: 1, title: "Umfrageteil 1" },
        { config: part2, partNumber: 2, title: "Umfrageteil 2: Hinweis" },
        { config: part3, partNumber: 3, title: "Umfrageteil 3" },
      ].map(({ config, partNumber, title }) => {
        const responsesForPart = allSurveyResponses.filter((r) => r.surveyPart === partNumber)
        if (!part3 && partNumber === 3) return null
        if (!config) return null
        return (
          <div key={partNumber} className="mb-10">
            <h1 className="mt-4 text-xl font-bold">{title}</h1>
            {responsesForPart.length === 0 ? (
              <p className="text-gray-500">Keine Antworten vorhanden.</p>
            ) : (
              responsesForPart.map((response) => (
                <div key={response.id} className="mb-6 rounded-sm border border-gray-300 p-4">
                  <p>Surveysession ID: {response.surveySessionId}</p>
                  <AnswerDisplay
                    partConfig={config}
                    answers={JSON.parse(response.data) as Record<string, unknown>}
                  />
                </div>
              ))
            )}
          </div>
        )
      })}
    </>
  )
}

type AnswerDisplayProps = {
  partConfig: SurveyPart1and3 | SurveyPart2
  answers: Record<string, unknown>
}

const AnswerDisplay = ({ partConfig, answers }: AnswerDisplayProps) => {
  return (
    <div className="space-y-6">
      {partConfig.pages.map((page) => (
        <div key={page.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          {page.fields.map((field) => {
            if (field.component === "SurveyPageTitle" || field.component === "SurveyMarkdown")
              return null

            return (
              <div key={field.name} className="mb-4">
                <strong className="mb-1 block text-gray-700">{field.props.label}</strong>
                <SurveyResponseFieldValue
                  field={field}
                  value={answers[field.name]}
                  emptyLabel={<em>Keine Antwort</em>}
                />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
