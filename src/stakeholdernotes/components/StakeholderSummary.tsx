import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"

type Props = Pick<SubsectionWithPosition, "stakeholdernotesCounts">

export const StakeholderSummary: React.FC<Props> = ({ stakeholdernotesCounts }) => {
  if (!stakeholdernotesCounts?.relevant) return null

  return (
    <p>
      <strong>Stakeholder:</strong> {stakeholdernotesCounts.done} von{" "}
      {stakeholdernotesCounts.relevant} geklärt
    </p>
  )
}
