import { formatGerKm } from "@/src/pagesComponents/subsections/utils/formatNumericInfo"
import getStatsInfopanelProjectSubsections from "@/src/server/projects/queries/getStatsInfopanelProjectSubsections"
import { useQuery } from "@blitzjs/rpc"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellSubsections: React.FC<Props> = ({ projectSlug }) => {
  const [{ projectLengthKm, numberOfSubsections, networHierarchiesSubsectionsWithCount }] =
    useQuery(getStatsInfopanelProjectSubsections, { projectSlug })

  return (
    <>
      {/* Gesamtlänge PAs */}
      <div>
        <p className="text-lg font-bold">Länge: {formatGerKm(projectLengthKm)}</p>
        <p>Planungsabschnitte: {numberOfSubsections}</p>
      </div>
      {networHierarchiesSubsectionsWithCount.length ? (
        <>
          <p className="font-bold">Netzstufen</p>
          <ul>
            {Object.entries(networHierarchiesSubsectionsWithCount).map(([key, value]) => (
              <li className="" key={key}>
                <span className="font-bold">{value.title}</span> <span>({value.count})</span>:{" "}
                <span>{formatGerKm(value.lengthKm)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Es wurden bisher keine Netzstufen eingetragen.</p>
      )}
    </>
  )
}
