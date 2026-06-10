import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/pages/Breadcrumb"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { Route as loggedInProjectRoute } from "@/src/routes/_loggedInProjects/$projectSlug"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const loggedInProjectRouteApi = getRouteApi(loggedInProjectRoute.id)

export const AbschnitteBreadcrumb = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const subsectionSlug = useTryRouteParam("subsectionSlug")
  const subsubsectionSlug = useTryRouteParam("subsubsectionSlug")

  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))

  const projectStepLink = subsectionSlug
    ? { to: "/$projectSlug" as const, params: { projectSlug } }
    : {}

  return (
    <Breadcrumb>
      <BreadcrumbStep {...projectStepLink}>{project.slug}</BreadcrumbStep>
      {subsectionSlug ? (
        <SubsectionCrumb
          projectSlug={projectSlug}
          subsectionSlug={subsectionSlug}
          subsubsectionSlug={subsubsectionSlug}
        />
      ) : null}
    </Breadcrumb>
  )
}

function SubsectionCrumb({
  projectSlug,
  subsectionSlug,
  subsubsectionSlug,
}: {
  projectSlug: string
  subsectionSlug: string
  subsubsectionSlug?: string
}) {
  if (!subsubsectionSlug) {
    return <BreadcrumbStep>{shortTitle(subsectionSlug)}</BreadcrumbStep>
  }

  return (
    <>
      <BreadcrumbStep
        to="/$projectSlug/abschnitte/$subsectionSlug"
        params={{ projectSlug, subsectionSlug }}
      >
        {shortTitle(subsectionSlug)}
      </BreadcrumbStep>
      <BreadcrumbStep>{shortTitle(subsubsectionSlug)}</BreadcrumbStep>
    </>
  )
}
