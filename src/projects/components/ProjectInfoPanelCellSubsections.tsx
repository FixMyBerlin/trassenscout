import { useQuery } from "@blitzjs/rpc"
import getStatsInfopanelCosts from "../queries/getStatsInfopanelProjectCosts"
import {
  formatGerCurrency,
  formatGerKm,
  formatGerPercentage,
} from "src/subsections/components/utils/formatNumericInfo"
import getStatsInfopanelProjectSubsections from "../queries/getStatsInfopanelProjectSubsections"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellSubsections: React.FC<Props> = ({ projectSlug }) => {
  const [{ projectLengthKm, networHierarchiesSubsectionsWithCount, qualityLevelsWithCount }] =
    useQuery(getStatsInfopanelProjectSubsections, {
      projectSlug: projectSlug!,
    })

  return (
    <>
      <div>
        {/* Gesamtlänge PAs */}
        <p className="font-bold text-lg">{formatGerKm(projectLengthKm)}</p>
      </div>
      {networHierarchiesSubsectionsWithCount.length ? (
        <>
          <p className="font-bold">Netzstufen</p>
          <ul>
            {Object.entries(networHierarchiesSubsectionsWithCount).map(([key, value]) => (
              <li className="" key={key}>
                <span className="font-bold">{value.title}</span> <span>({value.count})</span>:{" "}
                <span>{formatGerKm(value.lengthKm)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Es wurden bisher keine Netzstufen eingetragen.</p>
      )}
      {qualityLevelsWithCount.length ? (
        <>
          <p className="font-bold">Ausbaustandard</p>
          <ul>
            {Object.entries(qualityLevelsWithCount).map(([key, value]) => (
              <li className="" key={key}>
                <span className="font-bold uppercase">{value.slug}</span>{" "}
                <span>({value.count})</span>: <span>{formatGerKm(value.lengthKm)}</span>,{" "}
                <span>{!value.percentage ? "-" : formatGerPercentage(value.percentage)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Es wurden bisher keine Standards eingetragen.</p>
      )}
    </>
  )
}
