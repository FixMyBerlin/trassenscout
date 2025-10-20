import getStatsInfopanelProjectCompletion from "@/src/server/projects/queries/getStatsInfopanelProjectCompletion"
import { useQuery } from "@blitzjs/rpc"
import { compareAsc, getQuarter, getYear } from "date-fns"

type Props = {
  projectSlug: string
}
export const ProjectInfoPanelCellCompletion: React.FC<Props> = ({ projectSlug }) => {
  const [{ subsubsectionsWithEstimatedCompletionDate }] = useQuery(
    getStatsInfopanelProjectCompletion,
    { projectSlug },
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

  const sortedDates = arrayOfDates.sort(compareAsc)

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold">
        {"Q" + getQuarter(new Date(sortedDates[0]!)) + " / " + getYear(new Date(sortedDates[0]!))} -{" "}
        {"Q" +
          getQuarter(new Date(sortedDates[sortedDates.length - 1]!)) +
          " / " +
          getYear(new Date(sortedDates[sortedDates.length - 1]!))}
      </p>

      <div>
        <p>Realisierung Einträge nach Jahren:</p>
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
