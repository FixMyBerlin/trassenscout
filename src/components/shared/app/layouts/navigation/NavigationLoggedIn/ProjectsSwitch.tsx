import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import {
  checkmarkListboxOptionsPanelClassName,
  listboxOptionClassName,
  ListboxOptionLabel,
} from "@/src/components/core/components/forms/checkmarkListboxUi"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import type { ProjectsForCurrentUser } from "@/src/server/projects/types"

const DASHBOARD_VALUE = "__dashboard__"

type Props = { projects: ProjectsForCurrentUser }

export const ProjectsSwitch = ({ projects }: Props) => {
  const projectSlug = useTryRouteParam("projectSlug")
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  if (!projectSlug || !projects?.length || projects.length === 1) return null

  const projectItems = projects
    .map((project) => ({
      value: project.slug,
      searchText: shortTitle(project.slug),
      label: shortTitle(project.slug),
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
  const selectedItem = items.find((item) => item.value === projectSlug)
  const filteredItems =
    query === ""
      ? items
      : items.filter((item) => item.searchText.toLowerCase().includes(query.toLowerCase()))

  const selectItem = (value: string) => {
    setOpen(false)
    setQuery("")

    if (!value || value === projectSlug) return
    navigate({ to: value === DASHBOARD_VALUE ? "/dashboard" : `/${value}` })
  }

  return (
    <div className="relative ml-3">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={twJoin(
          "flex cursor-pointer rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-gray-800",
          "hover:bg-yellow-400 focus:bg-yellow-400",
          "focus:ring-2 focus:ring-white/30 focus:outline-hidden",
          open ? "bg-yellow-400" : "",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="sr-only">Projektwechsel</span>
        <span className="truncate">{selectedItem?.searchText ?? shortTitle(projectSlug)}</span>
        <ChevronDownIcon className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-64 max-w-[calc(100vw-1rem)] sm:right-auto sm:left-0 sm:max-w-none">
          <div className="rounded-md bg-white shadow-lg ring-1 ring-black/5">
            <div className="p-1.5">
              <input
                autoFocus
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setOpen(false)
                    setQuery("")
                  }
                }}
                placeholder="Suchen"
                className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-base placeholder-gray-400 focus:border-blue-500 focus:outline-hidden sm:text-sm"
              />
            </div>
            <div
              role="listbox"
              className={twJoin(checkmarkListboxOptionsPanelClassName, "max-h-[50vh] w-full")}
            >
              {filteredItems.map((item) => {
                const selected = item.value === projectSlug

                return (
                  <button
                    key={item.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-selected={selected ? "" : undefined}
                    className={twJoin(
                      listboxOptionClassName("checkmark"),
                      "block w-full text-left hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white focus:outline-hidden",
                    )}
                    onClick={() => selectItem(item.value)}
                  >
                    <ListboxOptionLabel ui="checkmark">{item.label}</ListboxOptionLabel>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
