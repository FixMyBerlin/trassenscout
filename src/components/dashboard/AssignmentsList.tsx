import { Spinner } from "@/src/components/core/components/Spinner"
import { AssignedRecordsTable } from "@/src/components/dashboard/AssignedRecordsTable"
import type { MyAssignedRecord } from "@/src/server/projectRecords/types"

type Props = {
  records: MyAssignedRecord[] | undefined
  isPlaceholderData: boolean
  showProject?: boolean
  onTagClick: (tag: string) => void
}

export function AssignmentsList({ records, isPlaceholderData, showProject, onTagClick }: Props) {
  if (!records) return <Spinner page />

  return (
    <div className={isPlaceholderData ? "opacity-50 transition-opacity" : undefined}>
      <AssignedRecordsTable records={records} showProject={showProject} onTagClick={onTagClick} />
    </div>
  )
}
