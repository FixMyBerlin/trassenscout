import {
  formatGerCurrency,
  formatGerM,
  formatGerPercentage,
} from "@/src/pagesComponents/subsections/utils/formatNumericInfo"
import getStatsInfopanelProjectCosts from "@/src/server/projects/queries/getStatsInfopanelProjectCosts"
import { useQuery } from "@blitzjs/rpc"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellCosts: React.FC<Props> = ({ projectSlug }) => {
  const [{ projectLengthM, accCosts, subsubsectionsWithCostsLengthM, costStructure }] = useQuery(
    getStatsInfopanelProjectCosts,
    { projectSlug },
  )

  return (
    <>
      <div>
        <p className="text-lg font-bold">{formatGerCurrency(accCosts)}</p>
        <p className="text-red-500">
          {formatGerM(subsubsectionsWithCostsLengthM)} von {formatGerM(projectLengthM)}
          {" ("}
          {formatGerPercentage(subsubsectionsWithCostsLengthM / (projectLengthM / 100))}
          {") "}definiert
        </p>
      </div>
      {accCosts !== 0 ? (
        <>
          <p className="font-bold">Einträge mit Kostendefinition</p>
          <ul>
            {Object.entries(costStructure).map(([key, value]) => (
              <li className="" key={key}>
                <span className="font-bold">{key}</span> <span>({value.numberSubsubs})</span>:{" "}
                <span>{formatGerM(value.sumLengthM)}</span>,{" "}
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
