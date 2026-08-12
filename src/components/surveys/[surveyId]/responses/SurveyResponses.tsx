import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { twJoin } from "tailwind-merge"
import {
  allowedSurveySlugs,
  type AllowedSurveySlugs,
} from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderToolbarLink } from "@/src/components/core/components/PageHeader/PageHeaderToolbarLink"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { EditableSurveyResponseFilterForm } from "@/src/components/surveys/[surveyId]/responses/EditableSurveyResponseFilterForm"
import EditableSurveyResponseListItem, {
  surveyResponseListGridClassName,
} from "@/src/components/surveys/[surveyId]/responses/EditableSurveyResponseListItem"
import { useDefaultFilterValues } from "@/src/components/surveys/[surveyId]/responses/useDefaultFilterValues"
import { useFilteredResponses } from "@/src/components/surveys/[surveyId]/responses/useFilteredResponses"
import { useSurveyResponseDetails } from "@/src/components/surveys/[surveyId]/responses/useSurveyResponseDetails"
import { useSurveyResponseFilters } from "@/src/components/surveys/[surveyId]/responses/useSurveyResponseFilters"
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

function isAllowedSurveySlug(slug: string): slug is AllowedSurveySlugs {
  return allowedSurveySlugs.includes(slug as AllowedSurveySlugs)
}

function SurveyResponsesWithoutPart2({ survey, tabs }: Pick<Props, "survey" | "tabs">) {
  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Eingaben"
            sectionTo="/$projectSlug/surveys"
            current={survey.title}
          />
        }
        tabs={<SurveyTabs tabs={tabs} embedded />}
      />
      <div className={pageContentPaddingClassName}>
        <SuperAdminBox>
          <p>In der Beteiligung {survey.slug.toUpperCase()} gibt es keinen Umfrageteil 2. </p>
        </SuperAdminBox>
      </div>
    </>
  )
}

type ConfiguredProps = Props & {
  surveySlug: AllowedSurveySlugs
}

function SurveyResponsesConfigured({ projectSlug, survey, tabs, surveySlug }: ConfiguredProps) {
  const navigate = useNavigate()
  const { data: feedbackData, refetch: refetchResponses } = useQuery(
    feedbackSurveyResponsesQueryOptions({
      projectSlug,
      surveyId: survey.id,
    }),
  )
  const feedbackSurveyResponses = feedbackData?.feedbackSurveyResponses ?? []
  const additionalFilterQuestionsWithResponseOptions =
    feedbackData?.additionalFilterQuestionsWithResponseOptions ?? []

  const defaultFilters = useDefaultFilterValues(surveySlug)
  const { filter, setFilter } = useSurveyResponseFilters()
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
  const filteredResponses = useFilteredResponses(feedbackSurveyResponses, surveySlug, topics)

  const { responseDetails: paramsSurveyResponseId } = useSurveyResponseDetails()
  const accordionRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(
    function scrollToOpenedSurveyResponse() {
      if (paramsSurveyResponseId) {
        const currentRef = accordionRefs.current?.at(paramsSurveyResponseId)
        currentRef?.scrollIntoView({ behavior: "smooth" })
      }
    },
    [paramsSurveyResponseId],
  )

  const feedbackDefinition = getConfigBySurveySlug(surveySlug, "part2")!

  const refetchResponsesAndTopics = async () => {
    await refetchTopics()
    await refetchResponses()
  }

  const handleTagClick = (tagTitle: string) => {
    void setFilter({
      ...(filter ?? defaultFilters),
      searchterm: `tag:${tagTitle}`,
    })
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
            section="Eingaben"
            sectionTo="/$projectSlug/surveys"
            current={survey.title}
          />
        }
        tabs={<SurveyTabs tabs={tabs} embedded />}
        viewMode="list"
        onViewModeChange={(mode) => {
          void navigate({
            to:
              mode === "map"
                ? "/$projectSlug/surveys/$surveyId/responses/map"
                : "/$projectSlug/surveys/$surveyId/responses",
            params: { projectSlug, surveyId: String(survey.id) },
            search: (prev) => prev,
          })
        }}
        toolbarAction={
          <PageHeaderToolbarLink
            href={`/api/${projectSlug}/surveys/${survey.id}/part2/results`}
            label="Alle Daten als .csv herunterladen"
          >
            CSV
          </PageHeaderToolbarLink>
        }
      />

      <EditableSurveyResponseFilterForm
        surveySlug={surveySlug}
        additionalFilters={additionalFilterQuestionsWithResponseOptions}
      />

      <div className={twJoin(pageContentPaddingClassName, "space-y-4")}>
        <ZeroCase visible={filteredResponses.length} name={"Eingaben"} />
        <p className="text-sm text-gray-500">
          {filteredResponses.length} {filteredResponses.length === 1 ? "Eingabe" : "Eingaben"}
        </p>
      </div>
      <section>
        <div className="border-y border-gray-200 bg-gray-50">
          <div
            className={twJoin(
              surveyResponseListGridClassName,
              "px-6 py-4 text-sm font-medium text-gray-900",
            )}
          >
            <div aria-hidden="true" />
            <div>ID</div>
            <div>Status</div>
            <div>Eingabe</div>
            <div>Tags</div>
            <div className="sr-only">Kommentare</div>
            <div aria-hidden="true" />
          </div>
        </div>
        {filteredResponses.map((response: FeedbackSurveyResponse) => (
          <div
            key={response.id}
            className="w-full overflow-hidden border border-b-0 border-gray-300 text-sm last:border-b"
            // @ts-expect-error TODO: this erros since we updated packages; we need to re-test this and maybe remove the feature?
            ref={(element) => (accordionRefs.current[response.id] = element)}
          >
            <EditableSurveyResponseListItem
              showMap
              isAccordion
              response={response}
              operators={operators}
              topics={topics}
              onTagClick={handleTagClick}
              refetchResponsesAndTopics={refetchResponsesAndTopics}
              mapProps={mapProps}
            />
          </div>
        ))}
      </section>
    </>
  )
}

export function SurveyResponses(props: Props) {
  const surveySlug = isAllowedSurveySlug(props.survey.slug) ? props.survey.slug : null
  const feedbackDefinition = surveySlug ? getConfigBySurveySlug(surveySlug, "part2") : undefined

  if (!surveySlug || !feedbackDefinition) {
    return <SurveyResponsesWithoutPart2 survey={props.survey} tabs={props.tabs} />
  }

  return <SurveyResponsesConfigured {...props} surveySlug={surveySlug} />
}
