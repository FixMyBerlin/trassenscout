import { Suspense } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"
import { ProjectRecordsInboxContent } from "@/src/components/project-records/inbox/ProjectRecordsInboxContent"

export function PageProjectRecordsInbox() {
  return (
    <Suspense fallback={<Spinner page />}>
      <ProjectRecordsInboxContent />
    </Suspense>
  )
}
