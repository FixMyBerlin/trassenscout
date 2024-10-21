import { Spinner } from "@/src/core/components/Spinner"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getStatsInfopanelSubsectionGeneral from "@/src/server/subsections/queries/getStatsInfopanelSubsectionGeneral"
import { useQuery } from "@blitzjs/rpc"
import {
  CalendarIcon,
  CheckCircleIcon,
  CurrencyEuroIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid"
import { ArrowUturnRightIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { Suspense } from "react"
import { SubsectionInfoPanelCellCompletion } from "./SubsectionInfoPanelCellCompletion"
import { SubsectionInfoPanelCellContainer } from "./SubsectionInfoPanelCellContainer"
import { SubsectionInfoPanelCellCosts } from "./SubsectionInfoPanelCellCosts"
import { SubsectionInfoPanelCellSubsection } from "./SubsectionInfoPanelCellSubsection"
import { SubsectionInfoPanelCellSubsubsections } from "./SubsectionInfoPanelCellSubsubsections"
import { SubsubsectionInfoPanelCellSubsectionsDetails } from "./SubsubsectionInfoPanelCellSubsectionsDetails"

export const ExperimentalSubsectionInfoPanel = () => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const enabled = projectSlug === "nudafa"
  const [subsection] = useQuery(
    getStatsInfopanelSubsectionGeneral,
    {
      subsectionSlug: subsectionSlug!,
      projectSlug,
    },
    { enabled },
  )

  if (!enabled || !subsection) return null

  return (
    <details>
      <summary className="mt-6 cursor-pointer">Info & Auswertung</summary>
      <div className="flex flex-col gap-2 bg-gray-100 py-4 text-gray-500">
        <div className="flex justify-between px-4">
          <div className="flex flex-row gap-2">
            <p className="text-gray-900">{subsection.operator?.title}</p>
            <p>{subsection.manager ? getFullname(subsection.manager) : "k.A."}</p>
          </div>
          <p>Reihenfolge: {subsection.order}</p>
        </div>
        <div className="grid grid-cols-3 divide-x text-sm md:grid-cols-4 lg:grid-cols-6">
          <SubsectionInfoPanelCellContainer
            icon={<CheckCircleIcon className="h-4 w-4" />}
            title="Führungen"
          >
            <Suspense fallback={<Spinner />}>
              <SubsectionInfoPanelCellSubsubsections
                subsectionSlug={subsectionSlug!}
                projectSlug={projectSlug!}
              />
            </Suspense>
          </SubsectionInfoPanelCellContainer>
          <SubsectionInfoPanelCellContainer
            icon={<ArrowUturnRightIcon className="h-4 w-4" />}
            title="Standards"
          >
            <Suspense fallback={<Spinner />}>
              <SubsubsectionInfoPanelCellSubsectionsDetails
                subsectionSlug={subsectionSlug!}
                projectSlug={projectSlug!}
              />
            </Suspense>
          </SubsectionInfoPanelCellContainer>
          <SubsectionInfoPanelCellContainer
            icon={<CurrencyEuroIcon className="h-4 w-4" />}
            title="Kosten"
          >
            <Suspense fallback={<Spinner />}>
              <SubsectionInfoPanelCellCosts
                subsectionSlug={subsectionSlug!}
                projectSlug={projectSlug!}
              />
            </Suspense>
          </SubsectionInfoPanelCellContainer>
          <SubsectionInfoPanelCellContainer
            icon={<CalendarIcon className="h-4 w-4" />}
            title="Realisierung"
          >
            <Suspense fallback={<Spinner />}>
              <SubsectionInfoPanelCellCompletion
                subsectionSlug={subsectionSlug!}
                projectSlug={projectSlug!}
              />
            </Suspense>
          </SubsectionInfoPanelCellContainer>
          <SubsectionInfoPanelCellContainer
            icon={<DocumentIcon className="h-4 w-4" />}
            title="Beschreibung"
          >
            <p>{subsection.description || "k.A."}</p>
          </SubsectionInfoPanelCellContainer>

          <SubsectionInfoPanelCellContainer
            icon={<QuestionMarkCircleIcon className="h-4 w-4" />}
            title="Planungsabschnitt"
          >
            <Suspense fallback={<Spinner />}>
              <SubsectionInfoPanelCellSubsection
                subsectionSlug={subsectionSlug!}
                projectSlug={projectSlug!}
              />
            </Suspense>
          </SubsectionInfoPanelCellContainer>
        </div>
      </div>
    </details>
  )
}
