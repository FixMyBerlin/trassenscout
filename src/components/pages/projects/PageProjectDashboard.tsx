import { Suspense } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"
import { ProjectDashboardClient } from "@/src/components/projects/ProjectDashboardClient"

export function PageProjectDashboard() {
  return (
    <Suspense fallback={<Spinner page />}>
      <ProjectDashboardClient />
    </Suspense>
  )
}
