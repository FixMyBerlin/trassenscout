import { GroupedSurveyResponseItem } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/analysis/GroupedSurveyResponseItem"
import { extractAndTransformQuestionsFromPages } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/format-survey-questions"
import { SurveyPart1and3 } from "@/src/app/beteiligung/_shared/types"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link, whiteButtonStyles } from "@/src/core/components/links"

type Props = {
  surveyDefinition: any
  projectSlug: string
  surveyId: number
  rawData: Array<Record<string, Record<string, number>>>
}

export const SurveyChartAndCsvDownloadSection = ({
  surveyDefinition,
  projectSlug,
  surveyId,
  rawData,
}: Props) => {
  // get all questions from surveyDefinition and transform them
  const surveyDefinitionArrayWithLatestQuestions = extractAndTransformQuestionsFromPages(
    surveyDefinition?.pages as SurveyPart1and3["pages"],
  )

  const groupedSurveyResponseData = rawData
    .map((r) => {
      const questionId = Object.keys(r)[0]
      const question = surveyDefinitionArrayWithLatestQuestions.find(
        (question) => String(questionId) === String(question.id),
      )

      if (
        !question ||
        !questionId ||
        // only multiple and single response questions are supported here
        !["singleResponse", "multipleResponse"].includes(question.component)
      )
        return
      const response = r[questionId]
      if (!response) return
      const data = Object.entries(response).map(([key, value]) => ({
        name:
          question?.options?.find((r) => String(r.key) === String(key))?.label ?? "Missing name",
        value,
      }))

      return { questionLabel: question.label, data }
    })
    .filter(Boolean)

  const handleCopyChartDataButtonClick = async () => {
    await navigator.clipboard.writeText(JSON.stringify(groupedSurveyResponseData))
  }
  return (
    <>
      <div className="mt-12 space-y-4">
        {groupedSurveyResponseData.map((questionItem) => {
          return (
            <GroupedSurveyResponseItem
              key={questionItem?.questionLabel}
              chartType={"bar"}
              responseData={questionItem?.data}
              questionLabel={questionItem?.questionLabel}
            />
          )
        })}
      </div>

      <SuperAdminBox>
        {surveyDefinition && (
          <div className="flex flex-col items-start gap-4">
            <button onClick={handleCopyChartDataButtonClick} className={whiteButtonStyles}>
              Ergebnisse Umfrageteil 1 in die Zwischenablage kopieren - formatiert für Diagramme
            </button>
            <Link href={`/api/${projectSlug}/surveys/${surveyId}/part1/questions`} button="white">
              Fragen des Umfrageteils 1 als CSV herunterladen
            </Link>
            <Link href={`/api/${projectSlug}/surveys/${surveyId}/part1/answers`} button="white">
              Antworten des Umfrageteils 1 als CSV herunterladen
            </Link>
            <Link href={`/api/${projectSlug}/surveys/${surveyId}/part1/results`} button="white">
              Ergebnisse des Umfrageteils 1 als CSV herunterladen
            </Link>
          </div>
        )}
      </SuperAdminBox>
    </>
  )
}
