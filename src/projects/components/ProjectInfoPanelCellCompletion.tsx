import { useQuery } from "@blitzjs/rpc"
import { getQuarter, getYear, max, min } from "date-fns"
import getStatsInfopanelProjectCompletion from "../queries/getStatsInfopanelProjectCompletion"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellCompletion: React.FC<Props> = ({ projectSlug }) => {
  const [{ subsubsectionsWithEstimatedCompletionDate }] = useQuery(
    getStatsInfopanelProjectCompletion,
    {
      projectSlug: projectSlug!,
    },
  )

  if (subsubsectionsWithEstimatedCompletionDate.length === 0)
    return (
      <div>
        <p>Es wurden bisher keine Realisierungsdaten eingetragen.</p>
      </div>
    )

  const arrayOfDates = subsubsectionsWithEstimatedCompletionDate.map(
    (subsub) => subsub.estimatedCompletionDate,
  )

  const maxEstimatedCompletionDate = max(arrayOfDates)
  const minEstimatedCompletionDate = min(arrayOfDates)

  return (
    <div className="flex flex-col gap-4">
      {minEstimatedCompletionDate && (
        <p className="font-bold">
          {"Q" +
            getQuarter(new Date(minEstimatedCompletionDate)) +
            " / " +
            getYear(new Date(minEstimatedCompletionDate))}{" "}
          -{" "}
          {"Q" +
            getQuarter(new Date(maxEstimatedCompletionDate)) +
            " / " +
            getYear(new Date(maxEstimatedCompletionDate))}
        </p>
      )}
      <div>
        <p>Führungen mit Datum der geplanten Realisierung:</p>
        <ul>
          {subsubsectionsWithEstimatedCompletionDate.map((s) => (
            <li className="space-x-2" key={s.id}>
              {s.slug.toUpperCase()} -{" "}
              {"Q" +
                getQuarter(new Date(s.estimatedCompletionDate)) +
                " / " +
                getYear(new Date(s.estimatedCompletionDate))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
