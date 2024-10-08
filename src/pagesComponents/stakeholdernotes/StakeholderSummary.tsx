import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"

type Props = Pick<SubsectionWithPosition, "stakeholdernotesCounts"> & {
  format: "number" | "labelNumber"
}

export const StakeholderSummary: React.FC<Props> = ({ format, stakeholdernotesCounts }) => {
  if (!stakeholdernotesCounts?.relevant) return null

  return (
    <p>
      {format === "labelNumber" && <strong>TÖBs:</strong>} {stakeholdernotesCounts.done} von{" "}
      {stakeholdernotesCounts.relevant} geklärt
    </p>
  )
}
