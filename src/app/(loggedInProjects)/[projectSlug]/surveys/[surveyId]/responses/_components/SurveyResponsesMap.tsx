"use client"

import EditableSurveyResponseListItem from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/EditableSurveyResponseListItem"
import { SurveyResponseOverviewMap } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/SurveyResponseOverviewMap"
import { useMapSelection } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/useMapSelection.nuqs"
import { useResponseDetails } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/useResponseDetails.nuqs"
import { getFlatSurveyFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getFlatSurveyFormFields"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H3 } from "@/src/core/components/text"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import getSurveyResponseTopicsByProject from "@/src/server/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { useEffect, useRef } from "react"
import { SurveyTabs } from "../../../_components/SurveyTabs"

type Survey = Awaited<ReturnType<typeof import("@/src/server/surveys/queries/getSurvey").default>>

type Props = {
  projectSlug: string
  surveyId: number
  survey: Survey
  tabs: Array<{ name: string; href: Route }>
}

export function SurveyResponsesMap({ projectSlug, surveyId, survey, tabs }: Props) {
  // the returned responses include the surveyPart1 data
  const [{ feedbackSurveyResponses }, { refetch: refetchResponses }] = useQuery(
    getFeedbackSurveyResponsesWithSurveyDataAndComments,
    {
      projectSlug,
      surveyId: survey.id,
    },
  )
  const { responseDetails } = useResponseDetails()

  const { mapSelection } = useMapSelection(
    feedbackSurveyResponses?.length ? [feedbackSurveyResponses[0]!.id] : [],
  )

  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ surveyResponseTopics: topics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    {
      projectSlug,
    },
  )

  // Whenever we submit the form, we also refetch, so the whole accordeon header and everything else is updated
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

  const part2Definition = getConfigBySurveySlug(survey.slug, "part2")
  const part2Fields = getFlatSurveyFormFields(part2Definition)
  const metaDefinition = getConfigBySurveySlug(survey.slug, "meta")

  const geometryCategoryId = getQuestionIdBySurveySlug(survey.slug, "geometryCategory")
  const locationId = getQuestionIdBySurveySlug(survey.slug, "location")

  const mapProps = // @ts-expect-error
    part2Fields.find((q) => [locationId, geometryCategoryId].includes(q.name))?.props.mapProps

  const maptilerUrl = metaDefinition.maptilerUrl

  const geoCategoryQuestion = part2Fields.find((q) => q.name === geometryCategoryId)
  // @ts-expect-error
  const mapData = geoCategoryQuestion ? geoCategoryQuestion.props.mapProps.mapData : undefined

  if (!feedbackSurveyResponses?.length) return null

  return (
    <>
      <div className="flex items-center justify-center px-6">
        <PageHeader
          title={survey.title}
          className="mt-12 w-full max-w-7xl"
          description={<SurveyTabs tabs={tabs} />}
        />
      </div>

      <div className="space-y-4">
        {mapSelectedResponses.length > 0 && (
          <>
            <div className="flex justify-end">
              <div className="lg:w-[580px]">
                <H3>
                  Ausgewählte{mapSelectedResponses.length === 1 ? "r" : ""}{" "}
                  {mapSelectedResponses.length === 1 ? "Beitrag" : "Beiträge"}
                </H3>
                <div className="mt-2 flex items-center">
                  <SurveyStaticPin surveySlug={survey.slug} small />
                  <small className="pl-4 text-[#7c3aed]">= Beitrag mit Verortung</small>
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
              surveySlug={survey.slug}
              additionalMapData={mapData}
            />
          </section>
          <section className="rounded-md drop-shadow-md lg:w-[580px]">
            {mapSelectedResponses.map((response) => (
              <div
                key={response.id}
                className="w-full overflow-hidden border border-b-0 border-gray-300 text-sm first:rounded-t-xl last:rounded-b-xl last:border-b"
                // I tried passing the ref as forwardRef but that did not work for unknown reasons.
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
      </div>
    </>
  )
}
