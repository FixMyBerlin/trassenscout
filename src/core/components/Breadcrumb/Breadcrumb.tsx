import { HomeIcon } from "@heroicons/react/20/solid"
import { Link } from "../links"
import { RouteUrlObject } from "blitz"
import { useSlugs } from "src/core/hooks"
import { useQuery } from "@blitzjs/rpc"
import getProject from "src/projects/queries/getProject"
import getSection from "src/sections/queries/getSection"
import { Routes } from "@blitzjs/next"
import getSubsection from "src/subsections/queries/getSubsection"

const BreadcrumbStep: React.FC<{ title: string; route?: RouteUrlObject }> = ({ title, route }) => {
  return (
    <li>
      <div className="flex items-center">
        <svg
          className="h-5 w-5 flex-shrink-0 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
        </svg>
        {typeof route === "object" ? (
          <Link href={route} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            {title}
          </Link>
        ) : (
          <span className="ml-4 text-sm font-medium text-gray-500" aria-current="page">
            {title}
          </span>
        )}
      </div>
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
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <a href="/" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Projektübersicht</span>
            </a>
          </div>
        </li>
        {project && (
          <BreadcrumbStep
            title={project.title}
            route={section ? Routes.ProjectDashboardPage({ projectSlug: projectSlug! }) : undefined}
          />
        )}
        {section && (
          <BreadcrumbStep
            title={section.title}
            route={
              subsection
                ? Routes.SectionDashboardPage({
                    projectSlug: projectSlug!,
                    sectionSlug: sectionSlug!,
                  })
                : undefined
            }
          />
        )}
        {subsection && (
          <BreadcrumbStep
            title={subsection.title}
            route={
              subsubsectionSlug
                ? Routes.SubsectionDashboardPage({
                    projectSlug: projectSlug!,
                    sectionSlug: sectionSlug!,
                    subsectionPath: [subsectionSlug!],
                  })
                : undefined
            }
          />
        )}
      </ol>
    </nav>
  )
}
