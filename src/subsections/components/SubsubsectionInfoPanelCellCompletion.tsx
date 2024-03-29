import { useQuery } from "@blitzjs/rpc"
import getStatsInfopanelCompletion from "../queries/getStatsInfopanelCompletion"
import { getQuarter, getYear } from "date-fns"

type Props = {
  subsectionSlug: string
  projectSlug: string
}
export const SubsubsectionInfoPanelCellCompletion: React.FC<Props> = ({
  subsectionSlug,
  projectSlug,
}) => {
  const [{ subsection }] = useQuery(getStatsInfopanelCompletion, {
    subsectionSlug: subsectionSlug!,
    projectSlug: projectSlug!,
  })

  if (subsection.subsubsections.length === 0)
    return (
      <div>
        <p>k. Führungen eingetragen</p>
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
