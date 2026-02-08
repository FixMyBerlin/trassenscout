"use client"

import { ProjectRecordsTable } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordTable"
import { linkStyles } from "@/src/core/components/links"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid"
import { XMarkIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useFilteredProjectRecords } from "../_utils/filter/useFilteredProjectRecords"
import { useFilters } from "../_utils/filter/useFilters.nuqs"

type Props = {
  projectRecords: Awaited<ReturnType<typeof getProjectRecords>>
  highlightId: number | null
}

export const FilteredProjectRecords = ({ projectRecords, highlightId }: Props) => {
  const { filter, setFilter } = useFilters()
  const filteredProjectRecords = useFilteredProjectRecords(projectRecords)

  return (
    <>
      <div>
        <form id="projectRecord-filter" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-end gap-3">
            <div className="w-[300px]">
              <input
                type="text"
                name="searchterm"
                value={filter?.searchterm ?? ""}
                onChange={(e) => setFilter({ searchterm: e.target.value })}
                placeholder="Beiträge nach Suchwort filtern"
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
              />
            </div>
            <button type="submit" className="h-full">
              <MagnifyingGlassIcon className="h-9 w-9 rounded-md bg-blue-500 p-2 text-white hover:bg-blue-800" />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Tags, Titel, Inhalte und Abschnitte durchsuchen
          </p>
        </form>
        <button
          type="button"
          className={clsx(linkStyles, "mt-4 flex items-center gap-2")}
          onClick={() => void setFilter({ searchterm: "" })}
        >
          <XMarkIcon className="size-4" />
          <span>Filter zurücksetzen</span>
        </button>
        <p className="mt-4 text-sm text-gray-500">
          {filteredProjectRecords.length} Protokoll
          {filteredProjectRecords.length !== 1 ? "einträge" : "eintrag"}
        </p>
      </div>
      {projectRecords.length === 0 ? (
        <ZeroCase visible={projectRecords.length} name="Protokolleinträge" />
      ) : (
        <ProjectRecordsTable
          isTopicFilter
          withSubsection
          withSubsubsection
          projectRecords={filteredProjectRecords}
          highlightId={highlightId}
        />
      )}
    </>
  )
}
