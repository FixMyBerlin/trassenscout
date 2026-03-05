import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { SurveyResponseFieldValue } from "@/src/app/beteiligung/_shared/utils/SurveyResponseFieldValue"
import { invoke } from "@/src/blitz-server"
import getSurveyResponses from "@/src/server/survey-responses/queries/getSurveyResponses"
import { Project } from "@prisma/client"
import React from "react"

type Props = { project: Project; surveyId: number; survey: any }

export const AdminSurveyResponsesNew = async ({ project, surveyId, survey }: Props) => {
  const allSurveyResponses = await invoke(getSurveyResponses, {
    projectSlug: project.slug,
    surveyId,
  })

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
        return (
          <div key={partNumber} className="mb-10">
            <h1 className="mt-4 text-xl font-bold">{title}</h1>
            {responsesForPart.length === 0 ? (
              <p className="text-gray-500">Keine Antworten vorhanden.</p>
            ) : (
              responsesForPart.map((response, index) => (
                <div
                  key={response.id || index}
                  className="mb-6 rounded-sm border border-gray-300 p-4"
                >
                  <p>Surveysession ID: {response.surveySession.id}</p>
                  {/* @ts-expect-error */}
                  <AnswerDisplay partConfig={config} answers={response.data} />
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
  partConfig: any
  answers: Record<string, any>
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ partConfig, answers }) => {
  return (
    <div className="space-y-6">
      {/* @ts-expect-error */}
      {partConfig.pages.map((page) => (
        <div key={page.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          {page.fields.map((field: any) => {
            // Skip fields (e.g., markdown, title)
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
