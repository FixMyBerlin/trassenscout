import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { Route as loggedInProjectRoute } from "@/src/routes/_loggedInProjects/$projectSlug"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const loggedInProjectRouteApi = getRouteApi(loggedInProjectRoute.id)

type Props = {
  /** Middle crumb label. Linked when `current` is set or `sectionTo` is provided. */
  section?: string
  sectionTo?: string
  sectionParams?: Record<string, string>
  /** Final non-link crumb */
  current?: string
}

export function ProjectPageBreadcrumb({ section, sectionTo, sectionParams, current }: Props) {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))

  const projectLinksToDashboard = Boolean(section || current)
  const sectionLinks = Boolean(current && (sectionTo || section))

  return (
    <Breadcrumb>
      <BreadcrumbStep
        {...(projectLinksToDashboard
          ? { to: "/$projectSlug" as const, params: { projectSlug } }
          : {})}
      >
        {shortTitle(project.slug)}
      </BreadcrumbStep>
      {section ? (
        sectionLinks && sectionTo ? (
          <BreadcrumbStep to={sectionTo} params={{ projectSlug, ...sectionParams }}>
            {section}
          </BreadcrumbStep>
        ) : (
          <BreadcrumbStep>{section}</BreadcrumbStep>
        )
      ) : null}
      {current ? <BreadcrumbStep>{current}</BreadcrumbStep> : null}
    </Breadcrumb>
  )
}
