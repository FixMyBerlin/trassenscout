import getStatsInfopanelSubsectionSubsubsections from "@/src/server/subsections/queries/getStatsInfopanelSubsectionSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { Fragment } from "react"
import { formatGerM, formatGerPercentage } from "./utils/formatNumericInfo"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsectionInfoPanelCellSubsubsections: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection, subsubsectionsCategoryCount }] = useQuery(
    getStatsInfopanelSubsectionSubsubsections,
    { subsectionSlug: subsectionSlug!, projectSlug },
  )

  return (
    <>
      <div>
        <p className="font-bold">Planungsabschnitt</p>
        <p className="text-red-500">
          {formatGerM(subsection.sumLengthMSubsubsections)} von {formatGerM(subsection.lengthM)} (
          {formatGerPercentage(subsection.sumLengthMSubsubsections / (subsection.lengthM / 100))})
          sind definiert
        </p>
      </div>
      <div>
        {subsection.subsubsections.length === 0
          ? "auf diesem PA wurden noch keine Einträge eingetragen"
          : Object.entries(subsubsectionsCategoryCount).map(([key, value]) => (
              <Fragment key={key}>
                <div className="font-bold">{key}</div>

                {Object.entries(value).map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>: <span>{k === "Summe" ? formatGerM(v) : v}</span>
                  </div>
                ))}
              </Fragment>
            ))}
      </div>
    </>
  )
}
