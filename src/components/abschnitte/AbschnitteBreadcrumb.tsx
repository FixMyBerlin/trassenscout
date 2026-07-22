import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { Route as loggedInProjectRoute } from "@/src/routes/_loggedInProjects/$projectSlug"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const loggedInProjectRouteApi = getRouteApi(loggedInProjectRoute.id)

export const AbschnitteBreadcrumb = ({ current }: { current?: string }) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const subsectionSlug = useTryRouteParam("subsectionSlug")
  const subsubsectionSlug = useTryRouteParam("subsubsectionSlug")

  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))

  const projectStepLink =
    subsectionSlug || current ? { to: "/$projectSlug" as const, params: { projectSlug } } : {}

  return (
    <Breadcrumb>
      <BreadcrumbStep {...projectStepLink}>{shortTitle(project.slug)}</BreadcrumbStep>
      {subsectionSlug ? (
        <SubsectionCrumb
          projectSlug={projectSlug}
          subsectionSlug={subsectionSlug}
          subsubsectionSlug={subsubsectionSlug}
          current={current}
        />
      ) : current ? (
        <BreadcrumbStep>{current}</BreadcrumbStep>
      ) : null}
    </Breadcrumb>
  )
}

function SubsectionCrumb({
  projectSlug,
  subsectionSlug,
  subsubsectionSlug,
  current,
}: {
  projectSlug: string
  subsectionSlug: string
  subsubsectionSlug?: string
  current?: string
}) {
  if (!subsubsectionSlug) {
    if (current) {
      return (
        <>
          <BreadcrumbStep
            to="/$projectSlug/abschnitte/$subsectionSlug"
            params={{ projectSlug, subsectionSlug }}
          >
            {shortTitle(subsectionSlug)}
          </BreadcrumbStep>
          <BreadcrumbStep>{current}</BreadcrumbStep>
        </>
      )
    }

    return <BreadcrumbStep>{shortTitle(subsectionSlug)}</BreadcrumbStep>
  }

  if (current) {
    return (
      <>
        <BreadcrumbStep
          to="/$projectSlug/abschnitte/$subsectionSlug"
          params={{ projectSlug, subsectionSlug }}
        >
          {shortTitle(subsectionSlug)}
        </BreadcrumbStep>
        <BreadcrumbStep
          to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
          params={{ projectSlug, subsectionSlug, subsubsectionSlug }}
        >
          {shortTitle(subsubsectionSlug)}
        </BreadcrumbStep>
        <BreadcrumbStep>{current}</BreadcrumbStep>
      </>
    )
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
