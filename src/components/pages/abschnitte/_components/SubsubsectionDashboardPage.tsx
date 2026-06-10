import {
  SubsubsectionDashboardClient,
  type SubsubsectionTabKey,
} from "@/src/components/abschnitte/SubsubsectionDashboardClient"
import type { SubsectionBySlug } from "@/src/server/subsections/types"
import type { SubsectionsList } from "@/src/server/subsections/types"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import { MapPageSuspense } from "./MapPageSuspense"

type Props = {
  activeTab: SubsubsectionTabKey
  subsection: SubsectionBySlug
  subsubsection: SubsubsectionWithPosition
  subsections: SubsectionsList
}

export function SubsubsectionDashboardPage({
  activeTab,
  subsection,
  subsubsection,
  subsections,
}: Props) {
  return (
    <MapPageSuspense>
      <SubsubsectionDashboardClient
        activeTab={activeTab}
        subsection={subsection}
        subsubsection={subsubsection}
        subsections={subsections}
      />
    </MapPageSuspense>
  )
}
