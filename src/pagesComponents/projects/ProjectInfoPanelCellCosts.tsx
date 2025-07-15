import {
  formatGerCurrency,
  formatGerKm,
  formatGerPercentage,
} from "@/src/pagesComponents/subsections/utils/formatNumericInfo"
import getStatsInfopanelProjectCosts from "@/src/server/projects/queries/getStatsInfopanelProjectCosts"
import { useQuery } from "@blitzjs/rpc"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellCosts: React.FC<Props> = ({ projectSlug }) => {
  const [{ projectLengthKm, accCosts, subsubsectionsWithCostsLengthKm, costStructure }] = useQuery(
    getStatsInfopanelProjectCosts,
    { projectSlug },
  )

  return (
    <>
      <div>
        <p className="text-lg font-bold">{formatGerCurrency(accCosts)}</p>
        <p className="text-red-500">
          {formatGerKm(subsubsectionsWithCostsLengthKm)} von {formatGerKm(projectLengthKm)}
          {" ("}
          {formatGerPercentage(subsubsectionsWithCostsLengthKm / (projectLengthKm / 100))}
          {") "}definiert
        </p>
      </div>
      {accCosts !== 0 ? (
        <>
          <p className="font-bold">Maßnahmen mit Kostendefinition</p>
          <ul>
            {Object.entries(costStructure).map(([key, value]) => (
              <li className="" key={key}>
                <span className="font-bold">{key}</span> <span>({value.numberSubsubs})</span>:{" "}
                <span>{formatGerKm(value.sumLengthKm)}</span>,{" "}
                <span>
                  {value.costs !== undefined ? formatGerCurrency(value.costs) : "keine Kosten"}{" "}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Es wurden bisher keine Kosten eingetragen.</p>
      )}
    </>
  )
}
