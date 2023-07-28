import { BlitzPage, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { H2, quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import GroupedSurveyResponseItem from "src/survey-responses/components/GroupedSurveyResponseItem"
import getSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import getSurveyByProjectSlug from "src/surveys/queries/getSurveyByProjectSlug"

export const SurveyResponseWithQuery = () => {
  const router = useRouter()
  const surveySlug = useParam("surveySlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const [survey] = useQuery(getSurveyByProjectSlug, { slug: surveySlug })
  const [{ groupedSurveyResponses, surveySessions }] = usePaginatedQuery(getSurveyResponses, {
    surveySlug,
  })

  const generalSurveyInformation: Array<Record<string, Record<string, number | string>>> = [
    {
      firstRow: {
        "Interesse an Updates": 66,
        Teilnehmer: surveySessions.length,
        "Zusätzliches Feedback ": 0,
        "Feedback mit Ortsangabe": 0,
        "Feedback ohne Ortsangabe": 0,
      },
    },
    { secondRow: { "Läuft seit": `${0}Tagen`, "Gestartet am ": 0, "Ende am": 0 } },
  ]

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.slug}`} />
      <PageHeader
        title={survey.title}
        description={
          <>
            <p className="mt-5 text-base text-gray-500">
              {`Dieser Bereich sammelt die Ergebnisse und Berichte der Beteiligung ${quote(
                survey.title,
              )}. Hier finden sie die Excel Tabelle und ausgewählte
            Auswertungsergebnisse.`}
              <br />
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
          </>
        }
        className="mt-12"
      />

      <div className="mt-16">
        <H2>Link zu Daten der Beteiligung </H2>
        <div className="mt-4 border rounded  py-3.5">
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
        <div className="p-6 flex flex-col gap-y-2.5 bg-gray-100 rounded">
          {generalSurveyInformation.map((row) => {
            console.log({ row })
            console.log(Object.values(row)[0])
            return (
              // eslint-disable-next-line react/jsx-key
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(Object.values(row)[0]).map(([k, v]) => {
                  console.log({ k })
                  console.log()
                  return (
                    <div key={k} className="flex flex-col gap-2.5">
                      <p className="text-gray-500 !text-sm">{k}</p>
                      <p className="font-bold">{v}</p>
                    </div>
                  )
                })}
              </div>
            )
          })}
          {/* <div className="grid grid-cols-5 gap-4">
            <div className="flex flex-col gap-2.5">
              <p className="text-gray-500 !text-sm">Interesse an Updates</p>
              <p className="font-bold">66</p>
            </div>
          </div> */}
        </div>
      </div>
      <div className="space-y-4 mt-12">
        <H2>Auswertung in Diagrammen und Korrelationen</H2>
        {Object.entries(groupedSurveyResponses).map(([k, v]) => {
          return <GroupedSurveyResponseItem key={k} chartType={"bar"} responseData={{ [k]: v }} />
        })}
      </div>
    </>
  )
}

const SurveyResponsePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SurveyResponseWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SurveyResponsePage.authenticate = true

export default SurveyResponsePage
