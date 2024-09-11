import { useQuery } from "@blitzjs/rpc"
import getStatsInfopanelCosts from "../queries/getStatsInfopanelSubsectionCosts"
import { formatGerCurrency, formatGerKm } from "./utils/formatNumericInfo"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsectionInfoPanelCellCosts: React.FC<Props> = ({ subsectionSlug, projectSlug }) => {
  const [{ subsection, costStructure }] = useQuery(getStatsInfopanelCosts, {
    subsectionSlug: subsectionSlug!,
    projectSlug: projectSlug!,
  })
  return (
    <>
      <div>
        <p className="text-lg font-bold">{formatGerCurrency(subsection.accCosts)}</p>
        <p className="text-red-500">
          {formatGerKm(subsection.subsubsectionsWithCostsLengthKm)} von{" "}
          {formatGerKm(subsection.lengthKm)} km definiert
        </p>
      </div>
      <p className="font-bold">Führungen mit Kostendefinition</p>
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
  )
}
