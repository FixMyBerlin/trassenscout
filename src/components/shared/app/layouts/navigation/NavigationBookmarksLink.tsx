import { BookmarkIcon } from "@heroicons/react/24/outline"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useLocation, useMatch } from "@tanstack/react-router"
import { twMerge } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import {
  navigationIconButtonClassName,
  navigationIconButtonCurrentClassName,
} from "./navigationIconButtonStyles"

export function NavigationBookmarksLink() {
  const projectMatch = useMatch({ from: "/_loggedInProjects/$projectSlug", shouldThrow: false })
  const { data: projects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())
  const current = useLocation().pathname === "/dashboard/bookmarks"

  if (!projects.some((project) => project.bookmarksEnabled)) return null

  const currentProject = projects.find(
    (project) => project.slug === projectMatch?.params.projectSlug,
  )
  const projectSlug = currentProject?.bookmarksEnabled ? currentProject.slug : undefined

  return (
    <Tooltip content="Meine Maßnahmen" variant="light" placement="bottom">
      <Link
        to="/dashboard/bookmarks"
        search={projectSlug ? { projectSlug } : undefined}
        aria-current={current ? "page" : undefined}
        className={twMerge(
          navigationIconButtonClassName,
          current && navigationIconButtonCurrentClassName,
        )}
      >
        <span className="sr-only">Meine Maßnahmen</span>
        <BookmarkIcon className="size-6" aria-hidden="true" />
      </Link>
    </Tooltip>
  )
}
