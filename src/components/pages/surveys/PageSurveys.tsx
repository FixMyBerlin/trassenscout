import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, redirect } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { NoSurveysInfoBox } from "@/src/components/surveys/NoSurveysInfoBox"
import { surveysQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export function PageSurveys() {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data: surveys } = useSuspenseQuery(surveysQueryOptions({ projectSlug }))

  if (!surveys.length) {
    return (
      <>
        <PageHeader title="Noch keine Beteiligung aktiv?" className="mt-12" />
        <NoSurveysInfoBox />
      </>
    )
  }

  if (surveys.length === 1) {
    throw redirect({
      to: "/$projectSlug/surveys/$surveyId/responses",
      params: { projectSlug, surveyId: String(surveys[0]!.id) },
    })
  }

  return (
    <>
      <PageHeader title="Beteiligungen" />
      <div className="flex flex-col gap-4">
        {surveys.map((survey) => (
          <Link key={survey.id} to={`/${projectSlug}/surveys/${survey.id}`}>
            {survey.title}
          </Link>
        ))}
      </div>
    </>
  )
}
