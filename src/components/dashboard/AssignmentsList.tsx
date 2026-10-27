import { Notice } from "@/src/components/core/components/Notice/Notice"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { Spinner } from "@/src/components/core/components/Spinner"
import { AssignedRecordsTable } from "@/src/components/dashboard/AssignedRecordsTable"
import type { MyAssignedRecord } from "@/src/server/projectRecords/types"

type Props = {
  records: MyAssignedRecord[] | undefined
  isError: boolean
  isPlaceholderData: boolean
  showProject?: boolean
  onTagClick: (tag: string) => void
}

export function AssignmentsList({
  records,
  isError,
  isPlaceholderData,
  showProject,
  onTagClick,
}: Props) {
  if (!records) {
    return isError ? (
      <div className={pageContentPaddingClassName}>
        <Notice type="error" title="Die Aufgaben konnten nicht geladen werden.">
          <p>Bitte laden Sie die Seite neu.</p>
        </Notice>
      </div>
    ) : (
      <Spinner page />
    )
  }

  return (
    <div className={isPlaceholderData ? "opacity-50 transition-opacity" : undefined}>
      <AssignedRecordsTable records={records} showProject={showProject} onTagClick={onTagClick} />
    </div>
  )
}
