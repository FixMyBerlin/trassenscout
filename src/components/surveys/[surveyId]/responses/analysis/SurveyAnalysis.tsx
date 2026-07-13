import { useQuery } from "@tanstack/react-query"
import { isFuture, isPast } from "date-fns"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { H2 } from "@/src/components/core/components/text/Headings"
import { SurveyChartAndCsvDownloadSection } from "@/src/components/surveys/[surveyId]/responses/analysis/SurveyChartAndCsvDownloadSection"
import { getFormatDistanceInDays } from "@/src/components/surveys/[surveyId]/responses/getFormatDistanceInDays"
import { SurveyTabs } from "@/src/components/surveys/SurveyTabs"
import { groupedSurveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import type { Survey } from "@/src/server/surveys/types"

type Props = {
  projectSlug: string
  surveyId: number
  survey: Survey
  tabs: Array<{ name: string; to: string }>
}

export function SurveyAnalysis({ projectSlug, surveyId: _surveyId, survey, tabs }: Props) {
  const { data } = useQuery(
    groupedSurveyResponsesQueryOptions({ projectSlug, surveyId: survey.id }),
  )
  const groupedSurveyResponsesFirstPart = data?.groupedSurveyResponsesFirstPart ?? {}
  const surveyResponsesFeedbackPart = data?.surveyResponsesFeedbackPart ?? []
  const participantCount = data?.count ?? 0

  const surveySlug = survey.slug as AllowedSurveySlugs

  const surveyDefinition = getConfigBySurveySlug(surveySlug, "part1")

  const userLocationQuestionId = getQuestionIdBySurveySlug(surveySlug, "location")

  const surveyResponsesFeedbackPartWithLocation = surveyResponsesFeedbackPart.filter(
    //  @ts-expect-error data is of type unknown
    (r) => JSON.parse(r.data)[userLocationQuestionId],
  )

  const isSurveyPast = survey.endDate && isPast(survey.endDate)
  const isSurveyFuture = survey.startDate && isFuture(survey.startDate)

  const generalSurveyInformation: Array<Record<string, Record<string, number | string>>> = [
    {
      firstRow: {
        "Interesse an Updates": survey.interestedParticipants || "k. A.",
        Teilnehmende: participantCount,
        "Inhaltliche Eingaben": surveyResponsesFeedbackPart.length,
        "Inhaltliche Eingaben mit Ortsangabe": surveyResponsesFeedbackPartWithLocation.length,
        "Inhaltliche Eingaben ohne Ortsangabe":
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

  return (
    <>
      <PageHeader title={survey.title} description={<SurveyTabs tabs={tabs} />} />

      <div>
        <div className="mt-4 flex flex-col gap-y-2.5 rounded-sm bg-gray-100 p-6">
          {generalSurveyInformation.map((row, i) => {
            return (
              <div key={i} className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {Object.entries(Object.values(row)[0] as Record<string, string | number>).map(
                  ([label, value]) => {
                    return (
                      <div key={label} className="flex flex-col justify-between gap-2.5">
                        <p className="text-sm! text-gray-500">{label}</p>
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

      <div className="mt-12 space-y-4">
        {!surveyDefinition ? (
          <SuperAdminBox>
            <p>In der Beteiligung {survey.slug.toUpperCase()} gibt es keinen Umfrageteil 1. </p>
          </SuperAdminBox>
        ) : (
          <>
            <H2>Auswertung in Diagrammen und Korrelationen</H2>
            {isSurveyFuture && <p>Die Beteiligung liegt in der Zukunft</p>}
            <SurveyChartAndCsvDownloadSection
              surveyDefinition={surveyDefinition}
              projectSlug={projectSlug}
              surveyId={survey.id}
              rawData={rawData}
            />
          </>
        )}
      </div>
      <SuperAdminBox>
        <Link to={`/admin/surveys/${survey.id}/edit`}>Bearbeiten</Link>
      </SuperAdminBox>
    </>
  )
}
