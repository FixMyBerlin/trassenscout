import { Spinner } from "@/src/core/components/Spinner"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getStatsInfopanelProjectGeneral from "@/src/server/projects/queries/getStatsInfopanelProjectGeneral"
import { useQuery } from "@blitzjs/rpc"
import {
  CheckCircleIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ViewColumnsIcon,
} from "@heroicons/react/20/solid"
import { CalendarIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { Suspense } from "react"
import { SubsectionInfoPanelCellContainer } from "../subsections/SubsectionInfoPanelCellContainer"
import { ProjectInfoPanelCellCompletion } from "./ProjectInfoPanelCellCompletion"
import { ProjectInfoPanelCellCosts } from "./ProjectInfoPanelCellCosts"
import { ProjectInfoPanelCellLeaderboard } from "./ProjectInfoPanelCellLeaderboard"
import { ProjectInfoPanelCellSubsections } from "./ProjectInfoPanelCellSubsections"
import { ProjectInfoPanelCellSubsubsections } from "./ProjectInfoPanelCellSubsubsections"

export const ExperimentalProjectInfoPanel = () => {
  const projectSlug = useProjectSlug()
  const enabled = projectSlug === "nudafa"
  const [project] = useQuery(getStatsInfopanelProjectGeneral, { projectSlug }, { enabled })

  if (!enabled || !project) return null

  return (
    <details>
      <summary className="mt-6 cursor-pointer">Info & Auswertung</summary>
      <div className="flex flex-col gap-2 bg-gray-100 py-4 text-gray-500">
        <div className="grid grid-cols-3 divide-x text-sm md:grid-cols-4 lg:grid-cols-6">
          {/* Beschreibung */}
          <SubsectionInfoPanelCellContainer
            icon={<DocumentIcon className="h-4 w-4" />}
            title="Beschreibung"
          >
            <p>{project.description || "k.A."}</p>
          </SubsectionInfoPanelCellContainer>

          {/* Planungsabschnitte */}
          <SubsectionInfoPanelCellContainer
            icon={<ViewColumnsIcon className="h-4 w-4" />}
            title="Planungsabschnitte"
          >
            <Suspense fallback={<Spinner />}>
              <ProjectInfoPanelCellSubsections projectSlug={projectSlug!} />
            </Suspense>
          </SubsectionInfoPanelCellContainer>

          {/* Führungen */}
          <SubsectionInfoPanelCellContainer
            icon={<CheckCircleIcon className="h-4 w-4" />}
            title="Führungen"
          >
            <Suspense fallback={<Spinner />}>
              <ProjectInfoPanelCellSubsubsections projectSlug={projectSlug!} />
            </Suspense>
          </SubsectionInfoPanelCellContainer>

          {/* Kosten */}
          <SubsectionInfoPanelCellContainer
            icon={<CurrencyEuroIcon className="h-4 w-4" />}
            title="Kosten"
          >
            <Suspense fallback={<Spinner />}>
              <ProjectInfoPanelCellCosts projectSlug={projectSlug!} />
            </Suspense>
          </SubsectionInfoPanelCellContainer>

          {/* Realisierung */}
          <SubsectionInfoPanelCellContainer
            icon={<CalendarIcon className="h-4 w-4" />}
            title="Realisierung"
          >
            <Suspense fallback={<Spinner />}>
              <ProjectInfoPanelCellCompletion projectSlug={projectSlug!} />
            </Suspense>
          </SubsectionInfoPanelCellContainer>

          {/* Baulastträger und Projektleiter:in */}
          <SubsectionInfoPanelCellContainer
            icon={<UserGroupIcon className="h-6 w-6" />}
            title="Baulastträger und Projektleiter:in"
          >
            <Suspense fallback={<Spinner />}>
              <ProjectInfoPanelCellLeaderboard projectSlug={projectSlug!} />
            </Suspense>
          </SubsectionInfoPanelCellContainer>
        </div>
      </div>
    </details>
  )
}
