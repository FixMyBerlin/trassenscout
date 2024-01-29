import { useQuery } from "@blitzjs/rpc"
import getStatsInfopanelCosts from "../queries/getStatsInfopanelCosts"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsubsectionInfoPanelCellCosts: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection, costStructure }] = useQuery(getStatsInfopanelCosts, {
    subsectionSlug: subsectionSlug!,
    projectSlug: projectSlug!,
  })
  return (
    <>
      <div>
        <p className="font-bold text-lg">{subsection.accCosts} €</p>
        <p className="text-red-500">
          {subsection.subsubsectionsWithCostsLengthKm} km von {subsection.lengthKm} km definiert
        </p>
      </div>
      <p className="font-bold">Führungen mit Kostendefinition</p>
      <ul>
        {Object.entries(costStructure).map(([key, value]) => (
          <li className="space-x-2" key={key}>
            <span>{value.sumLengthKm} km </span>
            <span className="font-bold">{key}</span>
            <span>({value.numberSubsubs})</span>
            <span>{value.costs !== undefined ? value.costs + " €" : "keine Kosten"} </span>
          </li>
        ))}
      </ul>
    </>
  )
}
