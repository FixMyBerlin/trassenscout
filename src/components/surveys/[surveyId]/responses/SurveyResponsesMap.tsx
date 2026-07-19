import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import SurveyStaticPin from "@/src/components/core/components/Map/SurveyStaticPin"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { H3 } from "@/src/components/core/components/text/Headings"
import EditableSurveyResponseListItem from "@/src/components/surveys/[surveyId]/responses/EditableSurveyResponseListItem"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import { SurveyResponseOverviewMap } from "@/src/components/surveys/[surveyId]/responses/SurveyResponseOverviewMap"
import { useSurveyResponseDetails } from "@/src/components/surveys/[surveyId]/responses/useSurveyResponseDetails"
import { useSurveyResponseMapSelection } from "@/src/components/surveys/[surveyId]/responses/useSurveyResponseMapSelection"
import { SurveyTabs } from "@/src/components/surveys/SurveyTabs"
import {
  adminLookupRowsWithCountQueryOptions,
  type OperatorWithSubsectionCount,
} from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { feedbackSurveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import {
  surveyResponseTagsQueryOptions,
  type SurveyResponseTagsResult,
} from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"
import type { Survey } from "@/src/server/surveys/types"

type Props = {
  projectSlug: string
  survey: Survey
  tabs: Array<{ name: string; to: string }>
}

export function SurveyResponsesMap({ projectSlug, survey, tabs }: Props) {
  const { data: feedbackData, refetch: refetchResponses } = useQuery(
    feedbackSurveyResponsesQueryOptions({
      projectSlug,
      surveyId: survey.id,
    }),
  )
  const feedbackSurveyResponses = feedbackData?.feedbackSurveyResponses ?? []
  const { responseDetails } = useSurveyResponseDetails()

  const surveySlug = survey.slug as AllowedSurveySlugs
  const geometryCategoryId = getQuestionIdBySurveySlug(surveySlug, "geometryCategory")
  const locationId = getQuestionIdBySurveySlug(surveySlug, "location")

  const firstLocatedResponse = feedbackSurveyResponses.find(
    (r) => r.data[locationId] || (geometryCategoryId && r.data[geometryCategoryId]),
  )
  const { mapSelection } = useSurveyResponseMapSelection(
    firstLocatedResponse ? [firstLocatedResponse.id] : [],
  )

  const { data: operatorsData } = useQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "operators" }),
  )
  const operators = (operatorsData?.rows ?? []) as OperatorWithSubsectionCount[]
  const { data: topicsData, refetch: refetchTopics } = useQuery(
    surveyResponseTagsQueryOptions({ projectSlug }),
  )
  const topics = (topicsData?.surveyResponseTags ??
    []) as SurveyResponseTagsResult["surveyResponseTags"]

  const refetchResponsesAndTopics = async () => {
    await refetchTopics()
    await refetchResponses()
  }

  const mapSelectedResponses = mapSelection
    ? feedbackSurveyResponses.filter((response) => mapSelection.includes(response.id))
    : []

  const accordionRefs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    if (responseDetails) {
      const currentRef = accordionRefs.current?.at(responseDetails)
      currentRef?.scrollIntoView({ behavior: "smooth" })
    }
  }, [responseDetails])

  const part2Definition = getConfigBySurveySlug(surveySlug, "part2")
  const part2Fields = getFlatSurveyFormFields(part2Definition)
  const metaDefinition = getConfigBySurveySlug(surveySlug, "meta")

  const mapProps = // @ts-expect-error
    part2Fields.find((q) => [locationId, geometryCategoryId].includes(q.name))?.props.mapProps

  const maptilerUrl = metaDefinition.maptilerUrl

  const responsesWithoutLocation = feedbackSurveyResponses.filter(
    (r) => !r.data[locationId] && !(geometryCategoryId && r.data[geometryCategoryId]),
  )

  if (!feedbackSurveyResponses?.length) return null

  return (
    <>
      <div className="flex items-center justify-center px-6">
        <PageHeader
          breadcrumb={
            <ProjectPageBreadcrumb
              section="Beteiligungen"
              sectionTo="/$projectSlug/surveys"
              current={survey.title}
            />
          }
          tabs={<SurveyTabs tabs={tabs} embedded />}
          className="mt-12 w-full max-w-7xl"
        />
      </div>

      <div className="space-y-4">
        {mapSelectedResponses.length > 0 && (
          <>
            <div className="flex justify-end">
              <div className="lg:w-[580px]">
                <H3>
                  Ausgewählte{mapSelectedResponses.length === 1 ? "r" : ""}{" "}
                  {mapSelectedResponses.length === 1 ? "Eingabe" : "Eingaben"}
                </H3>
                <div className="mt-2 flex items-center">
                  <SurveyStaticPin surveySlug={surveySlug} small />
                  <small className="pl-4 text-[#7c3aed]">= Eingabe mit Verortung</small>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="flex w-full max-w-full flex-col-reverse gap-2 pb-8 lg:flex-row">
          <section className="h-[600px] grow lg:h-[1000px]">
            <SurveyResponseOverviewMap
              maptilerUrl={maptilerUrl}
              defaultViewState={mapProps.config.bounds}
              categoryGeometryRef={geometryCategoryId}
              surveyResponses={feedbackSurveyResponses}
              locationRef={locationId}
              surveySlug={surveySlug}
            />
          </section>
          <section className="rounded-md drop-shadow-md lg:w-[580px]">
            {mapSelectedResponses.map((response) => (
              <div
                key={response.id}
                className="w-full overflow-hidden border border-b-0 border-gray-300 text-sm first:rounded-t-xl last:rounded-b-xl last:border-b"
                // @ts-expect-error TODO: this erros since we updated packages; we need to re-test this and maybe remove the feature?
                ref={(element) => (accordionRefs.current[response.id] = element)}
              >
                <EditableSurveyResponseListItem
                  isAccordion
                  response={response}
                  operators={operators}
                  topics={topics}
                  refetchResponsesAndTopics={refetchResponsesAndTopics}
                  showMap={false}
                  mapProps={mapProps}
                />
              </div>
            ))}
          </section>
        </div>
        {responsesWithoutLocation.length > 0 && (
          <div className="mx-auto max-w-7xl px-6 pb-8">
            <H3>Eingaben ohne Verortung</H3>
            <section className="mt-4">
              {responsesWithoutLocation.map((response) => (
                <div
                  key={response.id}
                  className="w-full overflow-hidden border border-b-0 border-gray-300 text-sm first:rounded-t-xl last:rounded-b-xl last:border-b"
                >
                  <EditableSurveyResponseListItem
                    isAccordion
                    showMap={false}
                    response={response}
                    operators={operators}
                    topics={topics}
                    refetchResponsesAndTopics={refetchResponsesAndTopics}
                    mapProps={mapProps}
                  />
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </>
  )
}
