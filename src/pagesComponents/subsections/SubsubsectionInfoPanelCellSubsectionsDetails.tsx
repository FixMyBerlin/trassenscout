import getStatsInfopanelSubsectionStandards from "@/src/server/subsections/queries/getStatsInfopanelSubsectionStandards"
import { useQuery } from "@blitzjs/rpc"
import { formatGerM, formatGerPercentage } from "./utils/formatNumericInfo"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsubsectionInfoPanelCellSubsectionsDetails: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection, qualityLevelsWithCount, sumLengthMSubsubsectionsWithStandard }] = useQuery(
    getStatsInfopanelSubsectionStandards,
    { subsectionSlug: subsectionSlug!, projectSlug },
  )
  return (
    <>
      <p className="text-red-500">
        {formatGerM(sumLengthMSubsubsectionsWithStandard)} von{" "}
        {formatGerM(subsection.sumLengthMSubsubsections)} (
        {formatGerPercentage(
          sumLengthMSubsubsectionsWithStandard / (subsection.sumLengthMSubsubsections / 100),
        )}
        ) sind definiert
      </p>

      <div>
        <p className="font-bold">Standards</p>
        <p>von allen Maßnahmen mit Ausbaustandard sind:</p>
      </div>
      <div>
        <ul>
          {qualityLevelsWithCount.map((ql) => (
            <li className="space-x-2" key={ql.slug}>
              <span className="font-bold uppercase">{ql.slug}: </span>
              <span>{formatGerPercentage(ql.sumOfLengthMPercentage)}</span>
              <span>{formatGerM(ql.sumOfLengthM)}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
