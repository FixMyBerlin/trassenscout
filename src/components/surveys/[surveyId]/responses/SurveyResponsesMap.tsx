import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import SurveyStaticPin from "@/src/components/core/components/Map/SurveyStaticPin"
import { MAP_VIEWPORT_SHELL_CLASS } from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { H3 } from "@/src/components/core/components/text/Headings"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
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
    <div className={MAP_VIEWPORT_SHELL_CLASS}>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Beteiligungen"
            sectionTo="/$projectSlug/surveys"
            current={survey.title}
          />
        }
        tabs={<SurveyTabs tabs={tabs} embedded />}
        className="mb-0 shrink-0"
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row lg:items-stretch">
        <aside className="min-h-0 w-full overflow-y-auto lg:h-full lg:w-[45%] lg:shrink-0">
          {mapSelectedResponses.length > 0 && (
            <div className="px-4 pt-4">
              <H3>
                Ausgewählte{mapSelectedResponses.length === 1 ? "r" : ""}{" "}
                {mapSelectedResponses.length === 1 ? "Eingabe" : "Eingaben"}
              </H3>
              <div className="mt-2 flex items-center">
                <SurveyStaticPin surveySlug={surveySlug} small />
                <small className="pl-4 text-[#7c3aed]">= Eingabe mit Verortung</small>
              </div>
            </div>
          )}

          {mapSelectedResponses.length > 0 && (
            <section className="px-4 pb-4">
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
          )}

          {responsesWithoutLocation.length > 0 && (
            <div className="px-4 pb-4">
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
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-gray-200 lg:border-t-0 lg:border-l">
          <SurveyResponseOverviewMap
            maptilerUrl={maptilerUrl}
            defaultViewState={mapProps.config.bounds}
            categoryGeometryRef={geometryCategoryId}
            surveyResponses={feedbackSurveyResponses}
            locationRef={locationId}
            surveySlug={surveySlug}
          />
        </div>
      </div>
    </div>
  )
}
