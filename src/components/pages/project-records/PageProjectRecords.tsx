import { Suspense } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"
import { ProjectRecordsFormAndTable } from "@/src/components/project-records/ProjectRecordsFormAndTable"

export function PageProjectRecords() {
  return (
    <Suspense fallback={<Spinner page />}>
      <ProjectRecordsFormAndTable />
    </Suspense>
  )
}
