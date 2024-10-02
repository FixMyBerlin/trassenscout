import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { RouteUrlObject } from "blitz"
import { Link } from "../links"
import { shortTitle } from "../text"

const BreadcrumbStep: React.FC<{ title: string; route?: RouteUrlObject; arrow: boolean }> = ({
  title,
  route,
  arrow,
}) => {
  return (
    <li className="flex items-center pl-3 first:pl-0">
      {typeof route === "object" ? (
        <Link href={route} className="pr-3 text-sm font-medium text-gray-500 hover:text-gray-700">
          {title}
        </Link>
      ) : (
        <span className="select-none pr-3 text-sm font-medium text-gray-500" aria-current="page">
          {title}
        </span>
      )}
      {arrow && <ChevronRightIcon className="mb-0.5 h-5 w-5 flex-shrink-0 text-gray-900" />}
    </li>
  )
}

export const Breadcrumb = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()

  // Performance note: We use the same queries that are used on pages, so react query can cache them.
  // This should have better performance then crafting one big selected query just for here.
  const [project] = useQuery(getProject, { projectSlug })
  const [subsection] = useQuery(
    getSubsection,
    {
      projectSlug,
      subsectionSlug: subsectionSlug!,
    },
    { enabled: !!projectSlug && !!subsectionSlug },
  )

  return (
    <nav className="mt-10 flex" aria-label="Breadcrumb">
      <ol className="flex items-center">
        {subsection && (
          <BreadcrumbStep
            title={shortTitle(project.slug)}
            route={subsection ? Routes.ProjectDashboardPage({ projectSlug }) : undefined}
            arrow={Boolean(subsection)}
          />
        )}
        {subsection && subsubsectionSlug && (
          <BreadcrumbStep
            title={shortTitle(subsection.slug)}
            route={
              subsubsectionSlug
                ? Routes.SubsectionDashboardPage({
                    projectSlug,
                    subsectionSlug: subsectionSlug!,
                  })
                : undefined
            }
            arrow={Boolean(subsection && subsubsectionSlug)}
          />
        )}
      </ol>
    </nav>
  )
}
