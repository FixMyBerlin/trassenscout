import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { isAfter } from "date-fns"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2 } from "src/core/components/text"
import { MetaTags } from "src/core/layouts"
import GroupedSurveyResponseItem from "src/survey-responses/components/GroupedSurveyResponseItem"
import getSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import getSurveyByProjectSlug from "src/surveys/queries/getSurveyByProjectSlug"

type Props = {
surveySlug: string
}

export const SurveyResultDisplayWithOverviewAndCharts: React.FC<Props> = ({surveySlug}) =>  {
  const [survey] = useQuery(getSurveyByProjectSlug, { slug: surveySlug })
  const [{ groupedSurveyResponsesFirstPart, surveySessions, surveyResponsesFeedbackPart }] =
    usePaginatedQuery(getSurveyResponses, {
      surveySlug,
    })

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
    return `${distanceInDays} Tage${distanceInDays > 1 && 'n'}`
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
        [`Endet${isSurveyPast ? "e" : ""} am`]:
          survey.endDate?.toLocaleDateString() || "(unbekannt)",
      },
    },
  ]

  return (
    <>
      <PageHeader
        title={survey.title}
        className="mt-12"
        description=
              {survey.active &&
            <p className="mt-5 text-base text-gray-500">

              Die Beteiligung ist über{" "}
              <Link
                blank
                className="!text-base"
                href={`https://trassenscout.de/beteiligung/${survey.slug}`}
              >
                diese Seite
                <ArrowTopRightOnSquareIcon className="ml-1 w-4 h-4 inline-flex mb-1" />
              </Link>{" "}
              erreichbar.
            </p>
        }

      />

      <div className="mt-4">
        <H2>Link zu Daten der Beteiligung </H2>
        <div className="mt-4 border rounded py-3.5">
          <Link
            blank
            className="flex gap-1 pl-3.5"
            href="https://docs.google.com/spreadsheets/d/1l25xYc09ZFqHF0rlacd-JYEJYhBr8LPFVfRGbdEvmyg/edit#gid=1717799827"
          >
            Beteiligungs-Ergebnisse
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="mt-12">
        <H2>Allgemeine Infos </H2>
        <div className="mt-4 p-6 flex flex-col gap-y-2.5 bg-gray-100 rounded">
          {generalSurveyInformation.map((row, i) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <div key={i} className="grid sm:grid-cols-5 gap-2 grid-cols-3">
                {Object.entries(Object.values(row)[0] as Record<string, string | number>).map(([k, v]) => {
                  return (
                    <div key={k} className="flex flex-col gap-2.5 justify-between">
                      <p className="text-gray-500 !text-sm">{k}</p>
                      <p className="font-bold">{v}</p>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
       <div className="space-y-4 mt-12">
        <H2>Auswertung in Diagrammen und Korrelationen</H2>
        {isSurveyFuture && <div>Die Beteiligung liegt in der Zukunft</div>}
        {!Boolean(surveySessions.length) ? <div>Es liegen keine Ergebnisse vor.</div> :Object.entries(groupedSurveyResponsesFirstPart).map(([k, v]) => {
          return <GroupedSurveyResponseItem key={k} chartType={"bar"} responseData={{ [k]: v }} />
        })}
      </div>
    </>
  )
}


export default SurveyResultDisplayWithOverviewAndCharts
