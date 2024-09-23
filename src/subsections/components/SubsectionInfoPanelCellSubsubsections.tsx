import { useQuery } from "@blitzjs/rpc"
import { Fragment } from "react"
import getStatsInfopanelSubsections from "../queries/getStatsInfopanelSubsectionSubsubsections"
import { formatGerKm, formatGerPercentage } from "./utils/formatNumericInfo"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsectionInfoPanelCellSubsubsections: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection, subsubsectionsCategoryCount }] = useQuery(getStatsInfopanelSubsections, {
    subsectionSlug: subsectionSlug!,
    projectSlug,
  })

  return (
    <>
      <div>
        <p className="font-bold">Planungsabschnitt</p>
        <p className="text-red-500">
          {formatGerKm(subsection.sumLengthKmSubsubsections)} von {formatGerKm(subsection.lengthKm)}{" "}
          ({formatGerPercentage(subsection.sumLengthKmSubsubsections / (subsection.lengthKm / 100))}
          ) sind definiert
        </p>
      </div>
      <div>
        {subsection.subsubsections.length === 0
          ? "auf diesem PA wurden noch keine Führungen eingetragen"
          : Object.entries(subsubsectionsCategoryCount).map(([key, value]) => (
              <Fragment key={key}>
                <div className="font-bold">{key}</div>

                {Object.entries(value).map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>: <span>{k === "Summe" ? formatGerKm(v) : v}</span>
                  </div>
                ))}
              </Fragment>
            ))}
      </div>
    </>
  )
}
