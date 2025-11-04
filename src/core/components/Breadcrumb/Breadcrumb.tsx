import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { RouteUrlObject } from "blitz"
import type { Route } from "next"
import { Link } from "../links"
import { shortTitle } from "../text"

type Props = { title: string; route?: RouteUrlObject | Route; arrow: boolean }

const BreadcrumbStep = ({ title, route, arrow }: Props) => {
  return (
    <li className="flex items-center pl-3 first:pl-0">
      {typeof route === "object" || typeof route === "string" ? (
        <Link href={route} className="pr-3 text-sm font-medium text-gray-500 hover:text-gray-700">
          {title}
        </Link>
      ) : (
        <span className="pr-3 text-sm font-medium text-gray-500 select-none" aria-current="page">
          {title}
        </span>
      )}
      {arrow && <ChevronRightIcon className="mb-0.5 h-5 w-5 shrink-0 text-gray-900" />}
    </li>
  )
}

export const Breadcrumb = () => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")

  // Performance note: We use the same queries that are used on pages, so react query can cache them.
  // This should have better performance then crafting one big selected query just for here.
  const [project] = useQuery(getProject, { projectSlug })
  const [subsection] = useQuery(
    getSubsection,
    { projectSlug, subsectionSlug: subsectionSlug! },
    { enabled: !!projectSlug && !!subsectionSlug },
  )
  const [subsubsection] = useQuery(
    getSubsubsection,
    { projectSlug, subsectionSlug: subsectionSlug!, subsubsectionSlug: subsubsectionSlug! },
    { enabled: !!projectSlug && !!subsectionSlug && !!subsubsectionSlug },
  )

  return (
    <nav className="mt-10 flex" aria-label="Breadcrumb">
      <ol className="flex items-center">
        <BreadcrumbStep title="Meine Projekte" route="/dashboard" arrow={true} />
        <BreadcrumbStep
          title={shortTitle(project.slug)}
          route={subsection ? Routes.ProjectDashboardPage({ projectSlug }) : undefined}
          arrow={Boolean(subsection)}
        />
        {subsection && (
          <BreadcrumbStep
            title={shortTitle(subsection.slug)}
            route={
              subsubsection
                ? Routes.SubsectionDashboardPage({
                    projectSlug,
                    subsectionSlug: subsectionSlug!,
                  })
                : undefined
            }
            arrow={Boolean(subsection && subsubsection)}
          />
        )}
        {subsubsection && (
          <BreadcrumbStep title={shortTitle(subsubsection.slug)} route={undefined} arrow={false} />
        )}
      </ol>
    </nav>
  )
}
