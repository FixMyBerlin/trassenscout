import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { isFuture, isPast } from "date-fns"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Spinner } from "src/core/components/Spinner"
import { Link, whiteButtonStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2 } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { TSurvey } from "src/survey-public/components/types"
import {
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "src/survey-public/utils/getConfigBySurveySlug"
import { GroupedSurveyResponseItem } from "src/survey-responses/components/analysis/GroupedSurveyResponseItem"
import getGroupedSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import { getFormatDistanceInDays } from "src/survey-responses/utils/getFormatDistanceInDays"
import {
  extractAndTransformQuestionsFromPages,
  transformDeletedQuestions,
} from "src/survey-responses/utils/format-survey-questions"
import { SurveyTabs } from "src/surveys/components/SurveyTabs"
import getSurvey from "src/surveys/queries/getSurvey"

export const Survey = () => {
  const { projectSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")
  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [{ groupedSurveyResponsesFirstPart, surveySessions, surveyResponsesFeedbackPart }] =
    usePaginatedQuery(getGroupedSurveyResponses, { projectSlug, surveyId: survey.id })

  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
  const responseConfig = getResponseConfigBySurveySlug(survey.slug)

  const feedbackQuestions = []

  for (let page of feedbackDefinition.pages) {
    page.questions && feedbackQuestions.push(...page.questions)
  }

  const userLocationQuestionId = responseConfig?.evaluationRefs["feedback-location"]

  const surveyResponsesFeedbackPartWithLocation = surveyResponsesFeedbackPart.filter(
    //  @ts-expect-error
    (r) => JSON.parse(r.data)[userLocationQuestionId],
  )

  const isSurveyPast = survey.endDate && isPast(survey.endDate)
  const isSurveyFuture = survey.startDate && isFuture(survey.startDate)

  const generalSurveyInformation: Array<Record<string, Record<string, number | string>>> = [
    {
      firstRow: {
        "Interesse an Updates": survey.interestedParticipants || "k. A.",
        Teilnehmende: surveySessions.length,
        "Inhaltliche Beiträge": surveyResponsesFeedbackPart.length,
        "Inhaltliche Beiträge mit Ortsangabe": surveyResponsesFeedbackPartWithLocation.length,
        "Inhaltliche Beiträge ohne Ortsangabe":
          surveyResponsesFeedbackPart.length - surveyResponsesFeedbackPartWithLocation.length,
      },
    },
    {
      secondRow: {
        [`${isSurveyPast ? "Laufzeit war" : "Laufzeit ist"}`]: getFormatDistanceInDays(
          survey.startDate,
          survey.endDate,
        ),
        [`${isSurveyFuture ? "Startet am" : "Gestartet am"}`]: survey.startDate
          ? survey.startDate.toLocaleDateString()
          : "k. A.",
        [`${isSurveyPast ? "Endete am" : "Endet am"}`]:
          survey.endDate?.toLocaleDateString() || "k. A.",
      },
    },
  ]

  // transform groupedSurveyResponsesFirstPart
  const rawData = Object.entries(groupedSurveyResponsesFirstPart).map(([k, v]) => {
    return { [k]: v }
  })

  // get all questions from surveyDefinition and transform them
  const surveyDefinitionArrayWithLatestQuestions = extractAndTransformQuestionsFromPages(
    surveyDefinition.pages as TSurvey["pages"],
  )

  // add th deleted questions to the array and transform them
  const surveyDefinitionArray = surveyDefinition.deletedQuestions
    ? surveyDefinitionArrayWithLatestQuestions.concat(
        transformDeletedQuestions(surveyDefinition.deletedQuestions),
      )
    : surveyDefinitionArrayWithLatestQuestions

  const groupedSurveyResponseData = rawData.map((r) => {
    const questionId = Object.keys(r)[0]
    const question = surveyDefinitionArray.find((question) => Number(questionId) === question.id)

    if (!question || !questionId) return
    const response = r[questionId]
    if (!response) return

    const data = Object.entries(response).map(([key, value]) => ({
      name: question?.props?.responses?.find((r) => r.id === Number(key))?.text ?? "Missing name",
      value,
    }))

    return { questionLabel: question.label, data }
  })

  const handleCopyChartDataButtonClick = async () => {
    await navigator.clipboard.writeText(JSON.stringify(groupedSurveyResponseData))
  }

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.title}`} />
      <PageHeader
        title={survey.title}
        className="mt-12"
        description={
          <>
            <SurveyTabs />
            <p className="mt-5 text-base text-gray-500">
              Dieser Bereich sammelt die Ergebnisse der Umfragen und Beteiligungen.
            </p>
            {survey.active && surveyDefinition.canonicalUrl && (
              <p className="text-base text-gray-500">
                Die Beteiligung ist über{" "}
                <Link blank className="!text-base" href={surveyDefinition.canonicalUrl}>
                  diese Seite
                  <ArrowTopRightOnSquareIcon className="ml-1 w-4 h-4 inline-flex mb-1" />
                </Link>{" "}
                erreichbar.
              </p>
            )}
          </>
        }
      />

      {/* <div className="mt-4">
        <H2>Link zu Daten der Beteiligung </H2>
        {survey.surveyResultsUrl ? (
          <div className="mt-4 border rounded py-3.5">
            <Link blank className="flex gap-1 pl-3.5" href={survey.surveyResultsUrl}>
              Beteiligungs-Ergebnisse
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-4">Es wurde bisher kein Link eingetragen.</div>
        )}
      </div> */}

      <div className="mt-12">
        <H2>Allgemeine Infos </H2>
        <div className="mt-4 p-6 flex flex-col gap-y-2.5 bg-gray-100 rounded">
          {generalSurveyInformation.map((row, i) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <div key={i} className="grid sm:grid-cols-5 gap-2 grid-cols-3">
                {Object.entries(Object.values(row)[0] as Record<string, string | number>).map(
                  ([label, value]) => {
                    return (
                      <div key={label} className="flex flex-col gap-2.5 justify-between">
                        <p className="text-gray-500 !text-sm">{label}</p>
                        <p className="font-semibold">{value}</p>
                      </div>
                    )
                  },
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4 mt-12">
        <H2>Auswertung in Diagrammen und Korrelationen</H2>
        {isSurveyFuture && <p>Die Beteiligung liegt in der Zukunft</p>}

        {!groupedSurveyResponseData.length ? (
          <p>Es liegen keine Ergebnisse vor.</p>
        ) : (
          groupedSurveyResponseData.map((questionItem) => {
            return (
              <GroupedSurveyResponseItem
                key={questionItem?.questionLabel}
                chartType={"bar"}
                responseData={questionItem?.data}
                questionLabel={questionItem?.questionLabel}
              />
            )
          })
        )}
      </div>

      <SuperAdminBox>
        <div className="flex flex-col gap-4 items-start">
          <button onClick={handleCopyChartDataButtonClick} className={whiteButtonStyles}>
            Beteiligungsergebnisse in die Zwischenablage kopieren - formatiert für Diagramme
          </button>
          <Link href={`/api/survey/${survey.id}/questions`} button="white">
            Fragen der Beteiligung als CSV herunterladen
          </Link>
          <Link href={`/api/survey/${survey.id}/responses`} button="white">
            Antworten der Beteiligung als CSV herunterladen
          </Link>
          <Link href={`/api/survey/${survey.id}/results`} button="white">
            Ergebnisse der Beteiligung als CSV herunterladen
          </Link>
        </div>
      </SuperAdminBox>

      <SuperAdminBox>
        <Link href={Routes.AdminEditSurveyPage({ surveyId: survey.id })}>Bearbeiten</Link>
      </SuperAdminBox>
    </>
  )
}

const SurveyPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <Survey />
      </Suspense>
    </LayoutRs>
  )
}

SurveyPage.authenticate = true

export default SurveyPage
