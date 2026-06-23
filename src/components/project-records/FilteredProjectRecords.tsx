import { MagnifyingGlassIcon } from "@heroicons/react/16/solid"
import { XMarkIcon } from "@heroicons/react/20/solid"
import { twJoin } from "tailwind-merge"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { ProjectRecordsTable } from "@/src/components/project-records/ProjectRecordTable"
import type { ProjectRecordsList } from "@/src/server/projectRecords/types"
import { useFilteredProjectRecords } from "./utils/filter/useFilteredProjectRecords"
import { useProjectRecordFilters } from "./utils/useProjectRecordFilters"

type Props = {
  projectRecords: ProjectRecordsList
  highlightId: number | null
}

export const FilteredProjectRecords = ({ projectRecords, highlightId }: Props) => {
  const { filter, setFilter } = useProjectRecordFilters()
  const filteredProjectRecords = useFilteredProjectRecords(projectRecords)
  const handleTopicClick = (topic: string) => {
    if (topic) void setFilter({ ...filter, searchterm: topic })
  }
  const handleAssigneeClick = (assigneeSearchText: string) => {
    if (assigneeSearchText) void setFilter({ ...filter, searchterm: assigneeSearchText })
  }

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
            Tags, Titel, Inhalte, Einträge und Zugewiesene durchsuchen
          </p>
        </form>
        <button
          type="button"
          className={twJoin(linkStyles, "mt-4 flex items-center gap-2")}
          onClick={() => void setFilter({ searchterm: "" })}
        >
          <XMarkIcon className="size-4" />
          <span>Filter zurücksetzen</span>
        </button>
      </div>
      {projectRecords.length === 0 ? (
        <ZeroCase visible={projectRecords.length} name="Protokolleinträge" />
      ) : (
        <ProjectRecordsTable
          isTopicFilter
          projectRecords={filteredProjectRecords}
          highlightId={highlightId}
          showRelationsColumn
          onTopicClick={handleTopicClick}
          onAssigneeClick={handleAssigneeClick}
        />
      )}
    </>
  )
}
