import { isSurveyLegacy } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Spinner } from "@/src/core/components/Spinner"
import { H2 } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlugId } from "@/src/core/routes/useSlug"
import { SurveyChartAndCsvDownloadSection } from "@/src/survey-responses/components/analysis/SurveyChartAndCsvDownloadSection"
import getGroupedSurveyResponses from "@/src/survey-responses/queries/getGroupedSurveyResponses"
import { getFormatDistanceInDays } from "@/src/survey-responses/utils/getFormatDistanceInDays"
import { SurveyTabs } from "@/src/surveys/components/SurveyTabs"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { BlitzPage } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { isFuture, isPast } from "date-fns"
import { Suspense } from "react"

export const Survey = () => {
  const projectSlug = useProjectSlug()
  const surveyId = useSlugId("surveyId")
  const [survey] = useQuery(getSurvey, { projectSlug, id: surveyId })
  const [{ groupedSurveyResponsesFirstPart, surveySessions, surveyResponsesFeedbackPart }] =
    usePaginatedQuery(getGroupedSurveyResponses, { projectSlug, surveyId: survey.id })

  const isLegacy = isSurveyLegacy(survey.slug)

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")

  // legacy survey
  const userLocationQuestionId = getQuestionIdBySurveySlug(survey.slug, "location")

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

  // legacy survey
  const canonicalUrl = getConfigBySurveySlug(survey.slug, "meta").canonicalUrl

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.title}`} />
      <PageHeader title={survey.title} className="mt-12" description={<SurveyTabs />} />

      <div className="mt-12">
        <div className="mt-4 flex flex-col gap-y-2.5 rounded-sm bg-gray-100 p-6">
          {generalSurveyInformation.map((row, i) => {
            return (
              // eslint-disable-next-line react/jsx-key
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
        <Link href={`/admin/surveys/${survey.id}/edit`}>Bearbeiten</Link>
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
