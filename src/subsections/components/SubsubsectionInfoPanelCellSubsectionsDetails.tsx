import { useQuery } from "@blitzjs/rpc"
import getStatsInfopanelSubsectionsDetails from "../queries/getStatsInfopanelSubsectionsDetails"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsubsectionInfoPanelCellSubsectionsDetails: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection, qualityLevelsWithCount, sumLengthKmSubsubsectionsWithStandard }] = useQuery(
    getStatsInfopanelSubsectionsDetails,
    {
      subsectionSlug: subsectionSlug!,
      projectSlug: projectSlug!,
    },
  )
  return (
    <>
      <p className="font-bold">Gesamtlänge Führungen {subsection.sumLengthKmSubsubsections} km</p>
      <p className="">mit eingetragenem Standard {sumLengthKmSubsubsectionsWithStandard} km</p>
      <div>
        <p className="font-bold">Standards</p>
        <p>von allen Führungen mit Ausbaustandard sind:</p>
      </div>
      <div>
        <ul>
          {qualityLevelsWithCount.map((ql) => (
            <li className="space-x-2" key={ql.slug}>
              <span className="uppercase font-bold">{ql.slug}: </span>
              <span>{ql.sumOfLengthKmPercentage} %</span>
              <span>{ql.sumOfLengthKm} km</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
