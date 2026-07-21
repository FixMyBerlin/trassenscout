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
      {projectRecords.length === 0 ? (
        <ZeroCase visible={projectRecords.length} name="Protokolleinträge" />
      ) : (
        <ProjectRecordsTable
          isTopicFilter
          flushTop
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
