import {
  formatGerKm,
  formatGerPercentage,
} from "@/src/pagesComponents/subsections/utils/formatNumericInfo"
import getStatsInfopanelProjectSubsubsections from "@/src/server/projects/queries/getStatsInfopanelProjectSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { Fragment } from "react"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellSubsubsections: React.FC<Props> = ({ projectSlug }) => {
  const [{ project, subsubsectionsCategoryCount, qualityLevelsWithCount }] = useQuery(
    getStatsInfopanelProjectSubsubsections,
    { projectSlug },
  )

  return (
    <>
      <div>
        <p className="font-bold">Projekt</p>
        <p className="text-red-500">
          {formatGerKm(project.sumLengthKmSubsubsections)} von{" "}
          {formatGerKm(project.projectLengthKm)} (
          {formatGerPercentage(project.sumLengthKmSubsubsections / (project.projectLengthKm / 100))}
          ) sind definiert
        </p>
      </div>
      {/* check if there are any subsubsections at all */}
      {subsubsectionsCategoryCount["RF (Bestand)"].Anzahl +
        subsubsectionsCategoryCount["RF (kein Bestand)"].Anzahl +
        subsubsectionsCategoryCount.SF.Anzahl !==
      0 ? (
        <div>
          {Object.entries(subsubsectionsCategoryCount).map(([key, value]) => (
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
      ) : (
        <p>Es wurden bisher keine Maßnahmen eingetragen.</p>
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
