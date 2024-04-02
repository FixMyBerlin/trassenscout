import { useQuery } from "@blitzjs/rpc"
import {
  formatGerKm,
  formatGerPercentage,
} from "src/subsections/components/utils/formatNumericInfo"
import getStatsInfopanelProjectSubsubsections from "../queries/getStatsInfopanelProjectSubsubsections"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellSubprojects: React.FC<Props> = ({ projectSlug }) => {
  const [{ project, subsubsectionsCategoryCount }] = useQuery(
    getStatsInfopanelProjectSubsubsections,
    {
      slug: projectSlug!,
    },
  )

  return (
    <>
      <div>
        <p className="font-bold">Planungsabschnitt</p>
        <p className="text-red-500">
          {formatGerKm(project.sumLengthKmSubsubsections)} von{" "}
          {formatGerKm(project.projectLengthKm)} (
          {formatGerPercentage(project.sumLengthKmSubsubsections / (project.projectLengthKm / 100))}
          ) sind definiert
        </p>
      </div>
      <div>
        {Object.entries(subsubsectionsCategoryCount).map(([key, value]) => (
          <>
            <div className="font-bold">{key}</div>

            {Object.entries(value).map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>: <span>{k === "Summe" ? formatGerKm(v) : v}</span>
              </div>
            ))}
          </>
        ))}
      </div>
    </>
  )
}
