import { BlitzPage, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { H3, quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import GroupedSurveyResponseItem from "src/survey-responses/components/GroupedSurveyResponseItem"
import getSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import getSurveyNew from "src/surveys/queries/getSurveyByProjectSlug"

export const SurveyResponseWithQuery = () => {
  const router = useRouter()
  const surveySlug = useParam("surveySlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const [survey] = useQuery(getSurveyNew, { slug: surveySlug })
  const [{ groupedSurveyResponses }] = usePaginatedQuery(getSurveyResponses, {
    surveySlug,
  })

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.slug}`} />
      <PageHeader
        title={survey.title}
        description={`Dieser Bereich sammelt die Ergebnisse und Berichte der Beteiligung ${quote(
          survey.title,
        )}. Hier finden sie die Excel Tabelle und ausgewählte Auswertungsergebnisse.`}
        className="mt-12"
      />
      <p className="mt-12">
        Die Beteiligung ist über{" "}
        <Link className="!text-base" href={`https://trassenscout.de/beteiligung/${survey.slug}`}>
          diese Seite
          {/* <ArrowTopRightOnSquareIcon className="w-4 h-4" /> */}
        </Link>{" "}
        erreichbar.
      </p>
      <div className="flex gap-4 mt-12">
        <Link className="border-b border-blue-500" href="#">
          Überblick
        </Link>
        <Link className="border-b border-blue-500" href="#">
          Auswertung
        </Link>
        <Link className="border-b border-blue-500" href="#">
          Beiträge Bürger:innen
        </Link>
      </div>
      <div className="mt-16">
        <H3>Link zu Daten der Beteiligung </H3>
        <div className="mt-8 border rounded  py-3.5">
          <Link className="flex gap-1 pl-3.5" href={"#"}>
            Beteiligungs-Ergebnisse
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-4 mt-12">
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
