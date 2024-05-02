import { useQuery } from "@blitzjs/rpc"
import {
  CheckCircleIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ViewColumnsIcon,
} from "@heroicons/react/20/solid"
import { CalendarIcon, DocumentIcon } from "@heroicons/react/24/outline"
import React, { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { useSlugs } from "src/core/hooks"
import { SubsectionInfoPanelCellContainer } from "../../subsections/components/SubsectionInfoPanelCellContainer"
import getStatsInfopanelProjectGeneral from "../queries/getStatsInfopanelProjectGeneral"
import { ProjectInfoPanelCellCompletion } from "./ProjectInfoPanelCellCompletion"
import { ProjectInfoPanelCellCosts } from "./ProjectInfoPanelCellCosts"
import { ProjectInfoPanelCellLeaderboard } from "./ProjectInfoPanelCellLeaderboard"
import { ProjectInfoPanelCellSubsections } from "./ProjectInfoPanelCellSubsections"
import { ProjectInfoPanelCellSubsubsections } from "./ProjectInfoPanelCellSubsubsections"

export const ProjectInfoPanel: React.FC = () => {
  const { projectSlug } = useSlugs()
  const [project] = useQuery(getStatsInfopanelProjectGeneral, {
    slug: projectSlug!,
  })

  return (
    <div className="flex flex-col gap-2 text-gray-500 bg-gray-100 py-4 ">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 divide-x text-sm">
        {/* Beschreibung */}
        <SubsectionInfoPanelCellContainer
          icon={<DocumentIcon className="w-4 h-4" />}
          title="Beschreibung"
        >
          <p>{project.description || "k.A."}</p>
        </SubsectionInfoPanelCellContainer>

        {/* Planungsabschnitte */}
        <SubsectionInfoPanelCellContainer
          icon={<ViewColumnsIcon className="w-4 h-4" />}
          title="Planungsabschnitte"
        >
          <Suspense fallback={<Spinner />}>
            <ProjectInfoPanelCellSubsections projectSlug={projectSlug!} />
          </Suspense>
        </SubsectionInfoPanelCellContainer>

        {/* Führungen */}
        <SubsectionInfoPanelCellContainer
          icon={<CheckCircleIcon className="w-4 h-4" />}
          title="Führungen"
        >
          <Suspense fallback={<Spinner />}>
            <ProjectInfoPanelCellSubsubsections projectSlug={projectSlug!} />
          </Suspense>
        </SubsectionInfoPanelCellContainer>

        {/* Kosten */}
        <SubsectionInfoPanelCellContainer
          icon={<CurrencyEuroIcon className="w-4 h-4" />}
          title="Kosten"
        >
          <Suspense fallback={<Spinner />}>
            <ProjectInfoPanelCellCosts projectSlug={projectSlug!} />
          </Suspense>
        </SubsectionInfoPanelCellContainer>

        {/* Realisierung */}
        <SubsectionInfoPanelCellContainer
          icon={<CalendarIcon className="w-4 h-4" />}
          title="Realisierung"
        >
          <Suspense fallback={<Spinner />}>
            <ProjectInfoPanelCellCompletion projectSlug={projectSlug!} />
          </Suspense>
        </SubsectionInfoPanelCellContainer>

        {/* Leaderboard Projektleiter:in */}
        <SubsectionInfoPanelCellContainer
          icon={<UserGroupIcon className="w-6 h-6" />}
          title="Leaderboard Projektleiter:in"
        >
          <Suspense fallback={<Spinner />}>
            <ProjectInfoPanelCellLeaderboard projectSlug={projectSlug!} />
          </Suspense>
        </SubsectionInfoPanelCellContainer>
      </div>
    </div>
  )
}
