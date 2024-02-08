import { useQuery } from "@blitzjs/rpc"
import {
  CalendarIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid"
import { ArrowUturnRightIcon, DocumentIcon } from "@heroicons/react/24/outline"
import React, { Suspense } from "react"
import { useSlugs } from "src/core/hooks"
import { getFullname } from "src/users/utils"
import getStatsInfopanel from "../queries/getStatsInfopanel"
import { SubsubsectionInfoPanelCellCompletion } from "./SubsubsectionInfoPanelCellCompletion"
import { SubsubsectionInfoPanelCellContainer } from "./SubsubsectionInfoPanelCellContainer"
import { SubsubsectionInfoPanelCellCosts } from "./SubsubsectionInfoPanelCellCosts"
import { SubsubsectionInfoPanelCellSubsection } from "./SubsubsectionInfoPanelCellSubsection"
import { SubsubsectionInfoPanelCellSubsections } from "./SubsubsectionInfoPanelCellSubsections"
import { SubsubsectionInfoPanelCellSubsectionsDetails } from "./SubsubsectionInfoPanelCellSubsectionsDetails"
import { Spinner } from "src/core/components/Spinner"

export const SubsubsectionInfoPanel: React.FC = () => {
  const { projectSlug, subsectionSlug } = useSlugs()
  const [subsection] = useQuery(getStatsInfopanel, {
    subsectionSlug: subsectionSlug!,
    projectSlug: projectSlug!,
  })

  return (
    <div className="flex flex-col gap-2 text-gray-500 bg-gray-100 py-4 ">
      <div className="flex justify-between px-4">
        <div className="flex flex-row gap-2">
          <p className="text-gray-900">{subsection.operator?.title}</p>
          <p>{subsection.manager ? getFullname(subsection.manager) : "k.A."}</p>
        </div>
        <p>Reihenfolge: {subsection.order}</p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 divide-x text-sm">
        <SubsubsectionInfoPanelCellContainer
          icon={<CheckCircleIcon className="w-4 h-4" />}
          title="Führungen"
        >
          <Suspense fallback={<Spinner />}>
            <SubsubsectionInfoPanelCellSubsections
              subsectionSlug={subsectionSlug!}
              projectSlug={projectSlug!}
            />
          </Suspense>
        </SubsubsectionInfoPanelCellContainer>
        <SubsubsectionInfoPanelCellContainer
          icon={<ArrowUturnRightIcon className="w-4 h-4" />}
          title="Standards"
        >
          <Suspense fallback={<Spinner />}>
            <SubsubsectionInfoPanelCellSubsectionsDetails
              subsectionSlug={subsectionSlug!}
              projectSlug={projectSlug!}
            />
          </Suspense>
        </SubsubsectionInfoPanelCellContainer>
        <SubsubsectionInfoPanelCellContainer
          icon={<CurrencyEuroIcon className="w-4 h-4" />}
          title="Kosten"
        >
          <Suspense fallback={<Spinner />}>
            <SubsubsectionInfoPanelCellCosts
              subsectionSlug={subsectionSlug!}
              projectSlug={projectSlug!}
            />
          </Suspense>
        </SubsubsectionInfoPanelCellContainer>
        <SubsubsectionInfoPanelCellContainer
          icon={<CalendarIcon className="w-4 h-4" />}
          title="Realisierung"
        >
          <Suspense fallback={<Spinner />}>
            <SubsubsectionInfoPanelCellCompletion
              subsectionSlug={subsectionSlug!}
              projectSlug={projectSlug!}
            />
          </Suspense>
        </SubsubsectionInfoPanelCellContainer>
        <SubsubsectionInfoPanelCellContainer
          icon={<DocumentIcon className="w-4 h-4" />}
          title="Beschreibung"
        >
          <p>{subsection.description || "k.A."}</p>
        </SubsubsectionInfoPanelCellContainer>

        <SubsubsectionInfoPanelCellContainer
          icon={<QuestionMarkCircleIcon className="w-4 h-4" />}
          title="Planungsabschnitt"
        >
          <Suspense fallback={<Spinner />}>
            <SubsubsectionInfoPanelCellSubsection
              subsectionSlug={subsectionSlug!}
              projectSlug={projectSlug!}
            />
          </Suspense>
        </SubsubsectionInfoPanelCellContainer>
      </div>
    </div>
  )
}
