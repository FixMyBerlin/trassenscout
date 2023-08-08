import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { isFuture, isPast } from "date-fns"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Spinner } from "src/core/components/Spinner"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2 } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import surveyDefinition from "src/participation/data/survey.json"
import GroupedSurveyResponseItem from "src/survey-responses/components/GroupedSurveyResponseItem"
import getGroupedSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import { getFormatDistanceInDays } from "src/survey-responses/utils/ getFormatDistanceInDays"
import getSurvey from "src/surveys/queries/getSurvey"

export const SurveyResponse = () => {
  const { projectSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")
  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [{ surveyResponsesFeedbackPart }] = usePaginatedQuery(getGroupedSurveyResponses, {
    projectSlug,
    surveyId: survey.id,
  })

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

      <div className="space-y-4 mt-12">
        <H2>Kommentare aus Bürgerbeteiligung</H2>
        <TableWrapper>
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="opacity-0 py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="uppercase px-3 py-3.5 text-left text-sm font-semibold text-gray-600"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="uppercase px-3 py-3.5 text-left text-sm font-semibold text-gray-600"
                >
                  Baulastträger
                </th>
                <th
                  scope="col"
                  className="uppercase px-3 py-3.5 text-left text-sm font-semibold text-gray-600"
                >
                  Kommentare
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {surveyResponsesFeedbackPart.map((response) => (
                <tr key={response.id}>
                  <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center font-medium text-gray-900">{response.id}</div>
                  </td>
                  <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center font-medium text-gray-900">
                      {response.status}
                    </div>
                  </td>
                  <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center font-medium text-gray-900">
                      {response.operatorId || "kein Baulastträger zugeordnet"}
                    </div>
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900 line-clamp-3">
                      {JSON.parse(response.data)["34"] || JSON.parse(response.data)["35"]}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
        <code>{JSON.stringify(surveyResponsesFeedbackPart)}</code>
      </div>
    </>
  )
}

const SurveyResponsePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SurveyResponse />
      </Suspense>
    </LayoutRs>
  )
}

SurveyResponsePage.authenticate = true

export default SurveyResponsePage
