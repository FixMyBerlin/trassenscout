import { ClockIcon } from "@heroicons/react/24/outline"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useLocation, useMatch } from "@tanstack/react-router"
import { twMerge } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import {
  canSeeProjectActivity,
  useCanSeeActivity,
} from "@/src/components/dashboard/useActivityTabs"
import type { MembershipRole } from "@/src/server/authorization/types"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import {
  navigationIconButtonClassName,
  navigationIconButtonCurrentClassName,
} from "./navigationIconButtonStyles"

function ActivityLinkButton({
  canSeeActivity,
  projectSlug,
}: {
  canSeeActivity: boolean
  projectSlug?: string
}) {
  const pathname = useLocation().pathname
  const current = pathname === "/dashboard/activity" || pathname === "/dashboard/assignments"

  return (
    <Tooltip content="Aktivität und Aufgaben" variant="light" placement="bottom">
      <Link
        to={canSeeActivity ? "/dashboard/activity" : "/dashboard/assignments"}
        search={projectSlug ? { projectSlug } : undefined}
        aria-current={current ? "page" : undefined}
        className={twMerge(
          navigationIconButtonClassName,
          current && navigationIconButtonCurrentClassName,
        )}
      >
        <span className="sr-only">Aktivität und Aufgaben</span>
        <ClockIcon className="size-6" aria-hidden="true" />
      </Link>
    </Tooltip>
  )
}

function ProjectActivityLink({
  projectSlug,
  membershipRole,
}: {
  projectSlug: string
  membershipRole: MembershipRole | null | undefined
}) {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())
  const { data: projects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())
  const project = projects.find((item) => item.slug === projectSlug)

  return (
    <ActivityLinkButton
      projectSlug={projectSlug}
      canSeeActivity={canSeeProjectActivity({
        role: user.role,
        membershipRole,
        showLogEntries: project?.showLogEntries,
      })}
    />
  )
}

function GeneralActivityLink() {
  const canSeeActivity = useCanSeeActivity()

  return <ActivityLinkButton canSeeActivity={canSeeActivity} />
}

export function NavigationActivityLink() {
  const projectMatch = useMatch({ from: "/_loggedInProjects/$projectSlug", shouldThrow: false })

  return projectMatch ? (
    <ProjectActivityLink
      projectSlug={projectMatch.params.projectSlug}
      membershipRole={projectMatch.context.membershipRole}
    />
  ) : (
    <GeneralActivityLink />
  )
}
