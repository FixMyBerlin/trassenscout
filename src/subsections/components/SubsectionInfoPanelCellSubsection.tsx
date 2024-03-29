import { useQuery } from "@blitzjs/rpc"
import getStatsInfopanelSubsection from "../queries/getStatsInfopanelSubsectionSubsection"
import { getPriorityTranslation } from "./utils/getPriorityTranslation"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsectionInfoPanelCellSubsection: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection, subsubsectionSpecialsWithCount }] = useQuery(getStatsInfopanelSubsection, {
    subsectionSlug: subsectionSlug!,
    projectSlug: projectSlug!,
  })

  return (
    <>
      <div>
        <p>
          Netzhierachie: {subsection.networkHierarchy ? subsection.networkHierarchy.title : "k.A."}
        </p>
        <p>Priorität: {getPriorityTranslation(subsection.priority)}</p>
      </div>
      <div>
        <p className="flex gap-2">
          <ExclamationTriangleIcon className="h-4 flex-shrink-0" />
          <span className="">Herausforderungen: {subsection.networkHierarchyId}</span>
        </p>
        <div className="text-red-500">
          {subsubsectionSpecialsWithCount.map((s) => {
            if (s.count === 0) return
            return (
              <span key={s.id}>
                {s.count} x {s.title}{" "}
              </span>
            )
          })}
        </div>
      </div>
    </>
  )
}
