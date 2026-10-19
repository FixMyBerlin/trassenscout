import { FilteredZeroCase } from "@/src/components/core/components/text/FilteredZeroCase"
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
  const { setFilter } = useProjectRecordFilters()
  const filteredProjectRecords = useFilteredProjectRecords(projectRecords)
  const handleAssigneeClick = (assigneeSearchText: string) => {
    if (assigneeSearchText) void setFilter({ searchterm: assigneeSearchText })
  }

  return (
    <>
      {projectRecords.length === 0 ? (
        <ZeroCase visible={projectRecords.length} name="Protokolleinträge" />
      ) : filteredProjectRecords.length === 0 ? (
        <FilteredZeroCase name="Protokolleinträge" onReset={() => void setFilter(undefined)} />
      ) : (
        <ProjectRecordsTable
          isTopicFilter
          projectRecords={filteredProjectRecords}
          highlightId={highlightId}
          showRelationsColumn
          onTopicClick={(tag) => void setFilter({ tag })}
          onAssigneeClick={handleAssigneeClick}
        />
      )}
    </>
  )
}
