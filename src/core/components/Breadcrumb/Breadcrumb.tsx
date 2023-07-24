import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { RouteUrlObject } from "blitz"
import { Link } from "../links"
import { shortTitle } from "../text"
import { useSlugs } from "src/core/hooks"
import getProject from "src/projects/queries/getProject"
import getSubsection from "src/subsections/queries/getSubsection"

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

export const Breadcrumb: React.FC = () => {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  // Performance note: We use the same queries that are used on pages, so react query can cache them.
  // This should have better performance then crafting one big selected query just for here.
  const [project] = useQuery(getProject, { slug: projectSlug! })
  const [subsection] = useQuery(
    getSubsection,
    {
      projectSlug: projectSlug!,
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
            route={
              subsection ? Routes.ProjectDashboardPage({ projectSlug: projectSlug! }) : undefined
            }
            arrow={Boolean(subsection)}
          />
        )}
        {subsection && subsubsectionSlug && (
          <BreadcrumbStep
            title={shortTitle(subsection.slug)}
            route={
              subsubsectionSlug
                ? Routes.SubsectionDashboardPage({
                    projectSlug: projectSlug!,
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
