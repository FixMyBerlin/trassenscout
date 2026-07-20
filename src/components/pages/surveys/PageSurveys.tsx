import { ChevronRightIcon, UserGroupIcon } from "@heroicons/react/20/solid"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { pageContentPaddingClassName } from "@/src/components/core/components/pages/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { NoSurveysInfoBox } from "@/src/components/surveys/NoSurveysInfoBox"
import { surveysQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

function formatSurveyDateRange(startDate: Date | null, endDate: Date | null) {
  const format = (date: Date) => date.toLocaleDateString("de-DE")

  if (startDate && endDate) return `${format(startDate)} – ${format(endDate)}`
  if (startDate) return `ab ${format(startDate)}`
  if (endDate) return `bis ${format(endDate)}`
  return null
}

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export function PageSurveys() {
  const navigate = useNavigate()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data: surveys } = useSuspenseQuery(surveysQueryOptions({ projectSlug }))

  if (!surveys.length) {
    return (
      <>
        <PageHeader breadcrumb={<ProjectPageBreadcrumb section="Beteiligungen" />} />
        <div className={pageContentPaddingClassName}>
          <NoSurveysInfoBox />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader breadcrumb={<ProjectPageBreadcrumb section="Beteiligungen" />} />
      <ul role="list" className="divide-y divide-gray-100">
        {surveys.map((survey) => {
          const dateRange = formatSurveyDateRange(survey.startDate, survey.endDate)

          return (
            <li
              key={survey.id}
              className="group relative flex cursor-pointer items-center gap-x-4 px-4 py-5 hover:bg-gray-50"
              onClick={() =>
                void navigate({
                  to: "/$projectSlug/surveys/$surveyId",
                  params: { projectSlug, surveyId: String(survey.id) },
                })
              }
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-50 group-hover:bg-white">
                <UserGroupIcon aria-hidden="true" className="size-6 text-gray-400" />
              </div>
              <p className="min-w-0 flex-1 text-sm/6 font-semibold text-gray-900">{survey.title}</p>
              <div className="hidden shrink-0 flex-col justify-center sm:flex">
                <p className="text-sm/6 text-gray-900">{survey.active ? "Aktiv" : "Inaktiv"}</p>
                {!survey.active && dateRange ? (
                  <p className="text-xs/5 text-gray-500">{dateRange}</p>
                ) : null}
              </div>
              <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
            </li>
          )
        })}
      </ul>
    </>
  )
}
