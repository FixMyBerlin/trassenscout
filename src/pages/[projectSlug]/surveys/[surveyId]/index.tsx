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
import surveyDefinition from "src/participation/data/survey.json"
import { Survey as TSurvey } from "src/participation/data/types"
import { GroupedSurveyResponseItem } from "src/survey-responses/components/analysis/GroupedSurveyResponseItem"
import getGroupedSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import { getFormatDistanceInDays } from "src/survey-responses/utils/getFormatDistanceInDays"
import { SurveyTabs } from "src/surveys/components/SurveyTabs"
import getSurvey from "src/surveys/queries/getSurvey"

export const Survey = () => {
  const { projectSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")
  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [{ groupedSurveyResponsesFirstPart, surveySessions, surveyResponsesFeedbackPart }] =
    usePaginatedQuery(getGroupedSurveyResponses, { projectSlug, surveyId: survey.id })

  type QuestionObject = {
    id: number
    label: string
    component: "singleResponse" | "multipleResponse" | "text"
    props: { responses: { id: number; text: string }[] }
  }

  function transformJSONToArray(json: TSurvey) {
    const pages = json.pages

    const transformedArray: QuestionObject[] = []

    pages.forEach((page) => {
      // Check if the page has questions
      if (page.questions && page.questions.length > 0) {
        const questions = page.questions
          .map((question) => {
            if (!("responses" in question.props)) return

            const questionObject = {
              id: question.id,
              label: question.label.de,
              component: question.component,
              props: {
                responses: question.props.responses.map((response) => {
                  return {
                    id: response.id,
                    text: response.text.de,
                  }
                }),
              },
            }
            return questionObject
          })
          .filter(Boolean)
        questions && transformedArray.push(...questions)
      }
    })

    return transformedArray
  }

  const surveyResponsesFeedbackPartWithLocation = surveyResponsesFeedbackPart.filter(
    //  @ts-expect-error
    (r) => JSON.parse(r.data)["23"],
  )

  const isSurveyPast = survey.endDate && isPast(survey.endDate)
  const isSurveyFuture = survey.startDate && isFuture(survey.startDate)

  const generalSurveyInformation: Array<Record<string, Record<string, number | string>>> = [
    {
      firstRow: {
        "Interesse an Updates": survey.interestedParticipants || "k. A.",
        Teilnehmer: surveySessions.length,
        "Zusätzliches Feedback": surveyResponsesFeedbackPart.length,
        "Feedback mit Ortsangabe": surveyResponsesFeedbackPartWithLocation.length,
        "Feedback ohne Ortsangabe":
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

  const rawData = Object.entries(groupedSurveyResponsesFirstPart).map(([k, v]) => {
    return { [k]: v }
  })

  // @ts-expect-error
  const surveyDefinitionArray: QuestionObject[] = transformJSONToArray(surveyDefinition)

  const groupedSurveyResponseData = rawData.map((r) => {
    const questionId = Object.keys(r)[0]
    const question = surveyDefinitionArray.find((question) => Number(questionId) === question.id)

    if (!question || !questionId) return
    const response = r[questionId]
    if (!response) return

    const data = Object.entries(response).map(([key, value]) => ({
      name: question?.props?.responses?.find((r) => r.id === Number(key))?.text ?? "(Missing name",
      value,
    }))

    return { questionLabel: question.label, data: data }
  })

  const handleCopyButtonClick = async () => {
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
              Dieser Bereich sammelt die Ergebnisse und Berichte der Beteiligung. Hier finden sie
              die Excel Tabelle und ausgewählte Auswertungsergebnisse.
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

      <div className="mt-4">
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
      </div>

      <div className="mt-12">
        <H2>Allgemeine Infos </H2>
        <div className="mt-4 p-6 flex flex-col gap-y-2.5 bg-gray-100 rounded">
          {generalSurveyInformation.map((row, i) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <div key={i} className="grid sm:grid-cols-5 gap-2 grid-cols-3">
                {Object.entries(Object.values(row)[0] as Record<string, string | number>).map(
                  ([k, v]) => {
                    return (
                      <div key={k} className="flex flex-col gap-2.5 justify-between">
                        <p className="text-gray-500 !text-sm">{k}</p>
                        <p className="font-bold">{v}</p>
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
        {isSurveyFuture && <div>Die Beteiligung liegt in der Zukunft</div>}
        {/* TODO check */}
        {!Boolean(surveySessions.length) || !Boolean(groupedSurveyResponseData.length) ? (
          <div>Es liegen keine Ergebnisse vor.</div>
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
        <div>
          <button onClick={handleCopyButtonClick} className={whiteButtonStyles}>
            Beteiligungsergebnisse in die Zwischenablage kopieren
          </button>
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
