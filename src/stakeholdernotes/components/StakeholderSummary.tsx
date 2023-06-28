import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"

type Props = Pick<SubsectionWithPosition, "stakeholdernotesCounts"> & {
  format: "number" | "labelNumber"
}

export const StakeholderSummary: React.FC<Props> = ({ format, stakeholdernotesCounts }) => {
  if (!stakeholdernotesCounts?.relevant) return null

  return (
    <p>
      {format === "labelNumber" && <strong>Stakeholder:</strong>} {stakeholdernotesCounts.done} von{" "}
      {stakeholdernotesCounts.relevant} geklärt
    </p>
  )
}
