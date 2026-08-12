import { useSuspenseQuery } from "@tanstack/react-query"
import { useMatchRoute, useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { ComboboxSingleBase } from "@/src/components/core/components/forms/ComboboxSingleBase"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { adminNavLinkOptions, getAdminProjectSwitchTarget } from "./adminNavigation"

export function AdminProjectSwitch() {
  const projectSlug = useTryRouteParam("projectSlug")
  const { data: projectsResult } = useSuspenseQuery(projectsAdminQueryOptions())
  const matchRoute = useMatchRoute()
  const navigate = useNavigate()
  const projects = projectsResult.projects

  if (!projects.length) return null

  const items = projects
    .map((project) => ({
      value: project.slug,
      searchText: shortTitle(project.slug),
      label: shortTitle(project.slug),
    }))
    .sort((a, b) => a.searchText.localeCompare(b.searchText))

  return (
    <div className="px-2 pb-2">
      <div className="pb-2 text-xs/6 font-semibold text-purple-300">Projektkonfiguration</div>
      <ComboboxSingleBase
        buttonSrLabel="Projektwechsel"
        classNameButton={twJoin(
          "flex w-full cursor-pointer rounded-md bg-purple-800 px-3 py-2 text-sm font-medium text-white",
          "hover:bg-purple-900 focus:bg-purple-900 data-open:bg-purple-900",
          "focus:ring-2 focus:ring-white/30 focus:outline-hidden",
        )}
        classNameDropdown="w-full"
        value={projectSlug ?? null}
        items={items}
        onChange={(value) => {
          if (!value || value === projectSlug) return
          navigate(adminNavLinkOptions(getAdminProjectSwitchTarget(matchRoute, value)))
        }}
      />
    </div>
  )
}
