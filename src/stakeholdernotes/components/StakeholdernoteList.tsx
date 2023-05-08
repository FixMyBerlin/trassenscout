import { Stakeholdernote } from "@prisma/client"
import { StakeholderItem } from "./StakeholderItem"

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

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {(Boolean(stakeholdersInProgress.length) || Boolean(stakeholdersPending.length)) && (
        <div>
          <div className="rounded-lg bg-gray-100 p-10">
            <h4 className="mb-6 text-lg font-bold">Offen</h4>
            <ul className="flex list-none flex-col space-y-4 pl-0">
              {stakeholdersInProgress.map((stakeholder) => {
                return (
                  <li key={stakeholder.id}>
                    <StakeholderItem stakeholder={stakeholder} />
                  </li>
                )
              })}
              {stakeholdersPending.map((stakeholder) => {
                return (
                  <li key={stakeholder.id}>
                    <StakeholderItem stakeholder={stakeholder} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
      {(Boolean(stakeholdersDone.length) || Boolean(stakeholdersIrrelevant.length)) && (
        <div>
          <div className="rounded-lg bg-gray-100 p-10">
            <h4 className="mb-6 font-bold">Erledigt</h4>
            <ul className="flex list-none flex-col space-y-2 pl-0">
              {stakeholdersDone.map((stakeholder) => {
                return (
                  <li key={stakeholder.id}>
                    <StakeholderItem stakeholder={stakeholder} />
                  </li>
                )
              })}
              {stakeholdersIrrelevant.map((stakeholder) => {
                return (
                  <li key={stakeholder.id}>
                    <StakeholderItem stakeholder={stakeholder} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default StakeholdernotesList
