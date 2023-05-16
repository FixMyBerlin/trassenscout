import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid"
import { Link } from "../links"
import { RouteUrlObject } from "blitz"
import { useSlugs } from "src/core/hooks"
import { useQuery } from "@blitzjs/rpc"
import getProject from "src/projects/queries/getProject"
import getSection from "src/sections/queries/getSection"
import { Routes } from "@blitzjs/next"
import getSubsection from "src/subsections/queries/getSubsection"
import { startEnd } from "../text/startEnd"

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
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  // Performance note: We use the same queries that are used on pages, so react query can cache them.
  // This should have better performance then crafting one big selected query just for here.
  const [project] = useQuery(getProject, { slug: projectSlug! })
  const [section] = useQuery(
    getSection,
    {
      projectSlug: projectSlug!,
      sectionSlug: sectionSlug!,
    },
    { enabled: !!sectionSlug }
  )
  const [subsection] = useQuery(
    getSubsection,
    {
      projectSlug: projectSlug!,
      sectionSlug: sectionSlug!,
      subsectionSlug: subsectionSlug!,
    },
    { enabled: !!sectionSlug && !!subsectionSlug }
  )

  return (
    <nav className="mt-10 flex" aria-label="Breadcrumb">
      <ol className="flex items-center">
        {section && (
          <BreadcrumbStep
            title={project.title}
            route={section ? Routes.ProjectDashboardPage({ projectSlug: projectSlug! }) : undefined}
            arrow={Boolean(section)}
          />
        )}
        {section && subsection && (
          <BreadcrumbStep
            title={startEnd(section)}
            route={
              subsection
                ? Routes.SectionDashboardPage({
                    projectSlug: projectSlug!,
                    sectionSlug: sectionSlug!,
                  })
                : undefined
            }
            arrow={Boolean(section && subsection)}
          />
        )}
        {subsection && subsubsectionSlug && (
          <BreadcrumbStep
            title={startEnd(subsection)}
            route={
              subsubsectionSlug
                ? Routes.SubsectionDashboardPage({
                    projectSlug: projectSlug!,
                    sectionSlug: sectionSlug!,
                    subsectionPath: [subsectionSlug!],
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
