import { Stakeholdernote } from "@prisma/client"

type Props = {
  stakeholdernotes: Stakeholdernote[]
}

export const StakeholderSummary: React.FC<Props> = ({ stakeholdernotes }) => {
  const stakeholdernotesDone = stakeholdernotes.filter(
    (stakeholder) => stakeholder.status === "DONE"
  )
  const stakeholdernotesRelevant = stakeholdernotes.filter(
    (stakeholder) => stakeholder.status !== "IRRELEVANT"
  )
  if (!stakeholdernotes.length) return null

  return (
    <p>
      <strong>Stakeholder:</strong> {stakeholdernotesDone.length} von{" "}
      {stakeholdernotesRelevant.length} geklärt
    </p>
  )
}
