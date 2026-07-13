import { useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { ComboboxSingleBase } from "@/src/components/core/components/forms/ComboboxSingleBase"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { CurrentUserCanIcon } from "@/src/components/shared/app/memberships/CurrentUserCanIcon"
import type { ProjectsForCurrentUser } from "@/src/server/projects/types"

const DASHBOARD_VALUE = "__dashboard__"

type Props = { projects: ProjectsForCurrentUser }

export const ProjectsSwitch = ({ projects }: Props) => {
  const projectSlug = useTryRouteParam("projectSlug")
  const navigate = useNavigate()

  if (!projectSlug || !projects?.length || projects.length === 1) return null

  const projectItems = projects
    .map((project) => ({
      value: project.slug,
      searchText: shortTitle(project.slug),
      label: (
        <span className="flex items-center justify-between gap-2">
          {shortTitle(project.slug)}
          <CurrentUserCanIcon projectSlug={project.slug} />
        </span>
      ),
    }))
    .sort((a, b) => a.searchText.localeCompare(b.searchText))

  const items = [
    {
      value: DASHBOARD_VALUE,
      searchText: "Meine Projekte",
      label: <strong>Meine Projekte</strong>,
    },
    ...projectItems,
  ]

  return (
    <div className="ml-3">
      <ComboboxSingleBase
        buttonSrLabel="Projektwechsel"
        classNameButton={twJoin(
          "flex cursor-pointer rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-gray-800",
          "hover:bg-yellow-400 focus:bg-yellow-400 data-open:bg-yellow-400",
          "focus:ring-2 focus:ring-white/30 focus:outline-hidden",
        )}
        classNameDropdown={twJoin(
          "right-0 w-64 max-w-[calc(100vw-1rem)]",
          "sm:right-auto sm:left-0 sm:max-w-none",
        )}
        value={projectSlug}
        items={items}
        onChange={(value) => {
          if (!value || value === projectSlug) return
          navigate({ to: value === DASHBOARD_VALUE ? "/dashboard" : `/${value}` })
        }}
      />
    </div>
  )
}
