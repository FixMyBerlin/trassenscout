import getStatsInfopanelSubsectionCompletion from "@/src/server/subsections/queries/getStatsInfopanelSubsectionCompletion"
import { useQuery } from "@blitzjs/rpc"
import { getQuarter, getYear } from "date-fns"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsectionInfoPanelCellCompletion: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection }] = useQuery(getStatsInfopanelSubsectionCompletion, {
    subsectionSlug: subsectionSlug!,
    projectSlug,
  })

  if (subsection.subsubsections.length === 0)
    return (
      <div>
        <p>k. Einträge eingetragen</p>
      </div>
    )
  return (
    <ul>
      {subsection.subsubsections.map((s) => (
        <li className="space-x-2" key={s.id}>
          {s.slug.toUpperCase()} -{" "}
          {s.estimatedCompletionDate
            ? "Q" +
              getQuarter(new Date(s.estimatedCompletionDate)) +
              " / " +
              getYear(new Date(s.estimatedCompletionDate))
            : "k.A."}
        </li>
      ))}
    </ul>
  )
}
