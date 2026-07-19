import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import SurveyStaticPin from "@/src/components/core/components/Map/SurveyStaticPin"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { H2 } from "@/src/components/core/components/text/Headings"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { EditableSurveyResponseFilterForm } from "@/src/components/surveys/[surveyId]/responses/EditableSurveyResponseFilterForm"
import EditableSurveyResponseListItem from "@/src/components/surveys/[surveyId]/responses/EditableSurveyResponseListItem"
import { useFilteredResponses } from "@/src/components/surveys/[surveyId]/responses/useFilteredResponses"
import { useSurveyResponseDetails } from "@/src/components/surveys/[surveyId]/responses/useSurveyResponseDetails"
import { SurveyTabs } from "@/src/components/surveys/SurveyTabs"
import {
  adminLookupRowsWithCountQueryOptions,
  type OperatorWithSubsectionCount,
} from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import {
  feedbackSurveyResponsesQueryOptions,
  type FeedbackSurveyResponse,
} from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import {
  surveyResponseTagsQueryOptions,
  type SurveyResponseTagsResult,
} from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"
import type { Survey } from "@/src/server/surveys/types"

type Props = {
  projectSlug: string
  surveyId: number
  survey: Survey
  tabs: Array<{ name: string; to: string }>
}

export function SurveyResponses({ projectSlug, surveyId: _surveyId, survey, tabs }: Props) {
  const { data: feedbackData, refetch: refetchResponses } = useQuery(
    feedbackSurveyResponsesQueryOptions({
      projectSlug,
      surveyId: survey.id,
    }),
  )
  const feedbackSurveyResponses = feedbackData?.feedbackSurveyResponses ?? []
  const additionalFilterQuestionsWithResponseOptions =
    feedbackData?.additionalFilterQuestionsWithResponseOptions ?? []

  const surveySlug = survey.slug as AllowedSurveySlugs
  const filteredResponses = useFilteredResponses(feedbackSurveyResponses, surveySlug)
  const { data: operatorsData } = useQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "operators" }),
  )
  const operators = (operatorsData?.rows ?? []) as OperatorWithSubsectionCount[]
  const { data: topicsData, refetch: refetchTopics } = useQuery({
    ...surveyResponseTagsQueryOptions({ projectSlug, includeArchived: true }),
    refetchOnReconnect: false,
  })
  const topics = (topicsData?.surveyResponseTags ??
    []) as SurveyResponseTagsResult["surveyResponseTags"]

  const { responseDetails: paramsSurveyResponseId } = useSurveyResponseDetails()
  const accordionRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    if (paramsSurveyResponseId) {
      const currentRef = accordionRefs.current?.at(paramsSurveyResponseId)
      currentRef?.scrollIntoView({ behavior: "smooth" })
    }
  }, [paramsSurveyResponseId])

  const feedbackDefinition = getConfigBySurveySlug(surveySlug, "part2")

  if (!feedbackDefinition)
    return (
      <>
        <PageHeader
          breadcrumb={
            <ProjectPageBreadcrumb
              section="Beteiligungen"
              sectionTo="/$projectSlug/surveys"
              current={survey.title}
            />
          }
          tabs={<SurveyTabs tabs={tabs} embedded />}
          title={survey.title}
        />
        <div className="mt-12 space-y-4">
          {" "}
          <SuperAdminBox>
            <p>In der Beteiligung {survey.slug.toUpperCase()} gibt es keinen Umfrageteil 2. </p>
          </SuperAdminBox>
        </div>
      </>
    )

  const refetchResponsesAndTopics = async () => {
    await refetchTopics()
    await refetchResponses()
  }

  const locationId = getQuestionIdBySurveySlug(surveySlug, "location")

  const mapProps = feedbackDefinition?.pages
    .find((page) => page.fields.some((field) => field.name === String(locationId)))
    ?.fields.find((q) => q.name === String(locationId))!.props

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Beteiligungen"
            sectionTo="/$projectSlug/surveys"
            current={survey.title}
          />
        }
        tabs={<SurveyTabs tabs={tabs} embedded />}
        title={survey.title}
      />

      <div className="mt-12 space-y-4">
        <H2>Eingaben</H2>
        <div className="mb-6">
          <Link
            className="mb-12 flex gap-1"
            href={`/api/${projectSlug}/surveys/${survey.id}/part2/results`}
          >
            <ArrowDownTrayIcon className="mr-1 size-5" />
            Alle Daten als .csv herunterladen
          </Link>
        </div>

        <EditableSurveyResponseFilterForm
          surveySlug={surveySlug}
          additionalFilters={additionalFilterQuestionsWithResponseOptions}
          operators={operators}
          topicsDefinition={topics}
        />

        <ZeroCase visible={filteredResponses.length} name={"Eingaben"} />
        <p className="mt-4 text-sm text-gray-500">
          {filteredResponses.length} {filteredResponses.length === 1 ? "Eingabe" : "Eingaben"}
        </p>
        {filteredResponses.length !== 0 && (
          <div className="mt-2 flex items-center">
            <SurveyStaticPin surveySlug={surveySlug} small />
            <small className="pl-4 text-[#7c3aed]">= Eingabe mit Verortung</small>
          </div>
        )}
        <section>
          {filteredResponses.map((response: FeedbackSurveyResponse) => (
            <div
              key={response.id}
              className="w-full overflow-hidden border border-b-0 border-gray-300 text-sm first:rounded-t-xl last:rounded-b-xl last:border-b"
              // @ts-expect-error TODO: this erros since we updated packages; we need to re-test this and maybe remove the feature?
              ref={(element) => (accordionRefs.current[response.id] = element)}
            >
              <EditableSurveyResponseListItem
                showMap
                isAccordion
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
    </>
  )
}
