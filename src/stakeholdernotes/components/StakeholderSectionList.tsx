import { Stakeholdernote } from "@prisma/client"
import { StakeholderSectionListItem } from "./StakeholderSectionListItem"

type props = {
  stakeholdernotes: Stakeholdernote[]
}

export const StakeholdernotesList: React.FC<props> = ({ stakeholdernotes }) => {
  const stakeholdersDone = stakeholdernotes.filter(
    (stakeholdernotes) => stakeholdernotes.status === "DONE"
  )
  const stakeholdersPending = stakeholdernotes.filter(
    (stakeholdernotes) => stakeholdernotes.status === "PENDING"
  )
  const stakeholdersIrrelevant = stakeholdernotes.filter(
    (stakeholdernotes) => stakeholdernotes.status === "IRRELEVANT"
  )
  const stakeholdersInProgress = stakeholdernotes.filter(
    (stakeholdernotes) => stakeholdernotes.status === "IN_PROGRESS"
  )

  if (!stakeholdernotes.length) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {(Boolean(stakeholdersInProgress.length) || Boolean(stakeholdersPending.length)) && (
        <div className="rounded-2xl bg-gray-50 py-7 px-8">
          <h3 className="mb-6 text-xl font-bold">Offen</h3>
          <ul className="flex list-none flex-col gap-7 pl-0">
            {stakeholdersInProgress.map((stakeholder) => {
              return (
                <li key={stakeholder.id}>
                  <StakeholderSectionListItem stakeholder={stakeholder} />
                </li>
              )
            })}
            {stakeholdersPending.map((stakeholder) => {
              return (
                <li key={stakeholder.id}>
                  <StakeholderSectionListItem stakeholder={stakeholder} />
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {(Boolean(stakeholdersDone.length) || Boolean(stakeholdersIrrelevant.length)) && (
        <div className="rounded-2xl bg-gray-50 py-7 px-8">
          <h3 className="mb-6 text-xl font-bold">Erledigt</h3>
          <ul className="flex list-none flex-col gap-7 pl-0">
            {stakeholdersDone.map((stakeholder) => {
              return (
                <li key={stakeholder.id}>
                  <StakeholderSectionListItem stakeholder={stakeholder} />
                </li>
              )
            })}
            {stakeholdersIrrelevant.map((stakeholder) => {
              return (
                <li key={stakeholder.id}>
                  <StakeholderSectionListItem stakeholder={stakeholder} />
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default StakeholdernotesList
