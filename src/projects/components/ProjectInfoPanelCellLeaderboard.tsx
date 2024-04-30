import { useQuery } from "@blitzjs/rpc"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import getStatsInfopanelProjectLeaderboard from "../queries/getStatsInfopanelProjectLeaderboard"
import { formatGerKm } from "src/subsections/components/utils/formatNumericInfo"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellLeaderboard: React.FC<Props> = ({ projectSlug }) => {
  const [{ operatorsWithCount, subsubsectionSpecialsWithCount, managersWithCount }] = useQuery(
    getStatsInfopanelProjectLeaderboard,
    {
      projectSlug: projectSlug!,
    },
  )
  return (
    <div className="flex gap-4 flex-col">
      <div className="">
        {Boolean(operatorsWithCount?.length) ? (
          <>
            <p className="font-bold">BLT</p>
            {operatorsWithCount.map((s) => {
              return (
                <p key={s.id}>
                  {s.title}: {s.count} PAs, {formatGerKm(s.lengthKm)}
                </p>
              )
            })}
          </>
        ) : (
          <p>Es wurden bisher keine Baulastträger eingetragen.</p>
        )}
      </div>
      <div>
        {Boolean(managersWithCount.length) ? (
          <>
            <p className="font-bold">Projektleiter:innen</p>
            {managersWithCount &&
              Object.entries(managersWithCount).map(([k, v]) => {
                return (
                  <p key={k}>
                    {k}: {v} PAs
                  </p>
                )
              })}
          </>
        ) : (
          <p>Es wurden bisher keine Projektleiter:innen eingetragen.</p>
        )}
      </div>
      <div>
        {Boolean(subsubsectionSpecialsWithCount?.length) ? (
          <>
            <p className="flex gap-2">
              <ExclamationTriangleIcon className="h-4 flex-shrink-0" />
              <span>Herausforderungen: </span>
            </p>
            {subsubsectionSpecialsWithCount.map((s) => {
              if (s.count === 0) return
              return (
                <span className="text-red-500" key={s.id}>
                  {s.count} x {s.title}{" "}
                </span>
              )
            })}
          </>
        ) : (
          <p>Es wurden bisher keine Herausforderungen eingetragen.</p>
        )}
      </div>
    </div>
  )
}
