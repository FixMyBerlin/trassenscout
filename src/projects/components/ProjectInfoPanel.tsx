import { useQuery } from "@blitzjs/rpc"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { DocumentIcon } from "@heroicons/react/24/outline"
import React, { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { useSlugs } from "src/core/hooks"
import { SubsectionInfoPanelCellContainer } from "../../subsections/components/SubsectionInfoPanelCellContainer"
import getStatsInfopanelProjectGeneral from "../queries/getStatsInfopanelProjectGeneral"
import { ProjectInfoPanelCellSubprojects } from "./ProjectInfoPanelCellSubsubsections"

export const ProjectInfoPanel: React.FC = () => {
  const { projectSlug } = useSlugs()
  const [project] = useQuery(getStatsInfopanelProjectGeneral, {
    slug: projectSlug!,
  })

  return (
    <div className="flex flex-col gap-2 text-gray-500 bg-gray-100 py-4 ">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 divide-x text-sm">
        <SubsectionInfoPanelCellContainer
          icon={<DocumentIcon className="w-4 h-4" />}
          title="Beschreibung"
        >
          <p>{project.description || "k.A."}</p>
        </SubsectionInfoPanelCellContainer>
        <SubsectionInfoPanelCellContainer
          icon={<CheckCircleIcon className="w-4 h-4" />}
          title="Führungen"
        >
          <Suspense fallback={<Spinner />}>
            <ProjectInfoPanelCellSubprojects projectSlug={projectSlug!} />
          </Suspense>
        </SubsectionInfoPanelCellContainer>
        {/* <SubsectionInfoPanelCellContainer
          icon={<CheckCircleIcon className="w-4 h-4" />}
          title="Führungen"
        >
          <Suspense fallback={<Spinner />}>
            <SubsectionInfoPanelCellSubsections
              subsectionSlug={subsectionSlug!}
              projectSlug={projectSlug!}
            />
          </Suspense>
        </SubsectionInfoPanelCellContainer>
        <SubsectionInfoPanelCellContainer
          icon={<ArrowUturnRightIcon className="w-4 h-4" />}
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
          icon={<CurrencyEuroIcon className="w-4 h-4" />}
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
          icon={<CalendarIcon className="w-4 h-4" />}
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
          icon={<QuestionMarkCircleIcon className="w-4 h-4" />}
          title="Planungsabschnitt"
        >
          <Suspense fallback={<Spinner />}>
            <SubsectionInfoPanelCellSubsection
              subsectionSlug={subsectionSlug!}
              projectSlug={projectSlug!}
            />
          </Suspense>
        </SubsectionInfoPanelCellContainer> */}
      </div>
    </div>
  )
}
