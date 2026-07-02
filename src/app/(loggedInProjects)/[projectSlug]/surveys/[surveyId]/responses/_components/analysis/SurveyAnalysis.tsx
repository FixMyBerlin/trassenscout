"use client"

import { SurveyChartAndCsvDownloadSection } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/analysis/SurveyChartAndCsvDownloadSection"
import { getFormatDistanceInDays } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getFormatDistanceInDays"
import { SurveyTabs } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/_components/SurveyTabs"
import { isSurveyLegacy } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H2 } from "@/src/core/components/text"
import getGroupedSurveyResponses from "@/src/server/survey-responses/queries/getGroupedSurveyResponses"
import { useQuery } from "@blitzjs/rpc"
import { isFuture, isPast } from "date-fns"
import { Route } from "next"

type Survey = Awaited<ReturnType<typeof import("@/src/server/surveys/queries/getSurvey").default>>

type Props = {
  projectSlug: string
  surveyId: number
  survey: Survey
  tabs: Array<{ name: string; href: Route }>
}

export function SurveyAnalysis({ projectSlug, surveyId, survey, tabs }: Props) {
  const [{ groupedSurveyResponsesFirstPart, surveySessions, surveyResponsesFeedbackPart }] =
    useQuery(getGroupedSurveyResponses, { projectSlug, surveyId: survey.id })

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
      <PageHeader title={survey.title} className="mt-12" description={<SurveyTabs tabs={tabs} />} />

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
