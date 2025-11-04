import getStatsInfopanelSubsectionSubsection from "@/src/server/subsections/queries/getStatsInfopanelSubsectionSubsection"
import { useQuery } from "@blitzjs/rpc"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { getPriorityTranslation } from "./utils/getPriorityTranslation"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsectionInfoPanelCellSubsection: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection, subsubsectionSpecialsWithCount }] = useQuery(
    getStatsInfopanelSubsectionSubsection,
    { subsectionSlug: subsectionSlug!, projectSlug },
  )

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
          <ExclamationTriangleIcon className="h-4 shrink-0" />
          <span>Herausforderungen: </span>
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
