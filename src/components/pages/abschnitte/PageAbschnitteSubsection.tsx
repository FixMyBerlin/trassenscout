import { SubsectionDashboardClient } from "@/src/components/abschnitte/SubsectionDashboardClient"
import { MapPageSuspense } from "./_components/MapPageSuspense"

export function PageAbschnitteSubsection() {
  return (
    <MapPageSuspense>
      <SubsectionDashboardClient />
    </MapPageSuspense>
  )
}
