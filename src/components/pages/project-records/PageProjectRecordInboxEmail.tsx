import { Suspense } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"
import { ProjectRecordInboxEmailContent } from "@/src/components/project-records/inbox/ProjectRecordInboxEmailContent"

export function PageProjectRecordInboxEmail() {
  return (
    <Suspense fallback={<Spinner page />}>
      <ProjectRecordInboxEmailContent />
    </Suspense>
  )
}
