import { useQuery } from "@blitzjs/rpc"
import getStatsInfopanelSubsections from "../queries/getStatsInfopanelSubsections"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsubsectionInfoPanelCellSubsections: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection, subsubsectionsCategoryCount }] = useQuery(getStatsInfopanelSubsections, {
    subsectionSlug: subsectionSlug!,
    projectSlug: projectSlug!,
  })

  return (
    <>
      <div>
        <p className="font-bold">Planungsabschnitt</p>
        <p>
          {subsection.sumLengthKmSubsubsections} km von {subsection.lengthKm} km sind definiert
        </p>
      </div>
      <div>
        {subsection.subsubsections.length === 0
          ? "auf diesem PA wurden noch keine Führungen eingetragen"
          : Object.entries(subsubsectionsCategoryCount).map(([key, value]) => (
              <>
                <div className="font-bold">{key}</div>

                {Object.entries(value).map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>: <span>{v}</span>
                  </div>
                ))}
              </>
            ))}
      </div>
    </>
  )
}
