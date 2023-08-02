import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { isAfter } from "date-fns"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2 } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import surveyDefinition from "src/participation/data/survey.json"
import GroupedSurveyResponseItem from "src/survey-responses/components/GroupedSurveyResponseItem"
import getGroupedSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import getSurvey from "src/surveys/queries/getSurvey"

export const Survey = () => {
  const { projectSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")
  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [{ groupedSurveyResponsesFirstPart, surveySessions, surveyResponsesFeedbackPart }] =
    usePaginatedQuery(getGroupedSurveyResponses, { projectSlug, surveyId: survey.id })

  const surveyResponsesFeedbackPartWithLocation = surveyResponsesFeedbackPart.filter(
    //  @ts-ignore
    (r) => JSON.parse(r.data)["23"],
  )

  const getFormatDistanceInDays = (startDate: any, endDate?: any) => {
    if (!startDate) return "(unbekannt)"
    const distanceInDays = Math.floor(((new Date() as any) - startDate) / (1000 * 60 * 60 * 24))
    if (isSurveyPast)
      return endDate
        ? `${Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))} Tage`
        : "(unbekannt)"
    return `${distanceInDays} ${distanceInDays > 1 ? "Tagen" : "Tag"}`
  }

  const isSurveyPast = survey.endDate && isAfter(new Date(), survey.endDate)
  const isSurveyFuture = survey.startDate && isAfter(survey.startDate, new Date())

  const generalSurveyInformation: Array<Record<string, Record<string, number | string>>> = [
    {
      firstRow: {
        "Interesse an Updates": survey.interestedParticipants || "(unbekannt)",
        Teilnehmer: surveySessions.length,
        "Zusätzliches Feedback": surveyResponsesFeedbackPart.length,
        "Feedback mit Ortsangabe": surveyResponsesFeedbackPartWithLocation.length,
        "Feedback ohne Ortsangabe":
          surveyResponsesFeedbackPart.length - surveyResponsesFeedbackPartWithLocation.length,
      },
    },
    {
      secondRow: {
        [`${isSurveyPast ? "Laufzeit war" : "Läuft seit"}`]: getFormatDistanceInDays(
          survey.startDate,
          survey.endDate,
        ),
        "Gestartet am ": survey.startDate ? survey.startDate.toLocaleDateString() : "(unbekannt)",
        [`${isSurveyPast ? "Endete am" : "Endet am"}`]:
          survey.endDate?.toLocaleDateString() || "(unbekannt)",
      },
    },
  ]

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.title}`} />
      <PageHeader
        title={survey.title}
        className="mt-12"
        description={
          <>
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
        {!Boolean(surveySessions.length) ? (
          <div>Es liegen keine Ergebnisse vor.</div>
        ) : (
          Object.entries(groupedSurveyResponsesFirstPart).map(([k, v]) => {
            return <GroupedSurveyResponseItem key={k} chartType={"bar"} responseData={{ [k]: v }} />
          })
        )}
      </div>

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
