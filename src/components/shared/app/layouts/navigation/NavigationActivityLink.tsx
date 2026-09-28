import { ClockIcon } from "@heroicons/react/24/outline"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useLocation, useRouteContext } from "@tanstack/react-router"
import { twMerge } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { canSeeProjectActivity } from "@/src/components/dashboard/useProjectPageTabs"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

const activityButtonClassName =
  "relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"

export function NavigationActivityLink() {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { membershipRole } = useRouteContext({ from: "/_loggedInProjects/$projectSlug" })
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())
  const { data: projects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())
  const pathname = useLocation().pathname
  const project = projects.find((item) => item.slug === projectSlug)

  if (
    !canSeeProjectActivity({
      role: user.role,
      membershipRole,
      showLogEntries: project?.showLogEntries,
    })
  ) {
    return null
  }

  const current =
    pathname === `/${projectSlug}/activity` || pathname === `/${projectSlug}/assignments`

  return (
    <Link
      to="/$projectSlug/activity"
      params={{ projectSlug }}
      aria-current={current ? "page" : undefined}
      classNameOverwrites={twMerge(
        activityButtonClassName,
        current && "bg-white text-gray-900 hover:bg-gray-100",
      )}
    >
      <span className="sr-only">Aktivität</span>
      <ClockIcon className="size-6" aria-hidden="true" />
    </Link>
  )
}
