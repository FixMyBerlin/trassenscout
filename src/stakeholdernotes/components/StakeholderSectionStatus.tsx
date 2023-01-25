import { Stakeholdernote } from "@prisma/client"

type props = {
  stakeholdernotes: Stakeholdernote[]
}

export const StakeholderSectionStatus: React.FC<props> = ({ stakeholdernotes }) => {
  const stakeholdernotesDone = stakeholdernotes.filter(
    (stakeholder) => stakeholder.status === "DONE"
  )

  if (!stakeholdernotes.length) return null

  return (
    <p>
      <strong>Stakeholder:</strong> {stakeholdernotesDone.length} von {stakeholdernotes.length}{" "}
      geklärt
    </p>
  )
}
