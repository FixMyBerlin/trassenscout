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

  const sortedStakeholdernotes = [
    ...stakeholdersInProgress,
    ...stakeholdersPending,
    ...stakeholdersDone,
    ...stakeholdersIrrelevant,
  ]

  if (!stakeholdernotes.length) {
    return null
  }

  return (
    <div className="not-prose overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div className="flex border-b border-gray-100 text-xs uppercase text-gray-500">
        <div className="w-64 pb-2 pl-4 pr-3 pt-3 sm:pl-6">Status</div>
        <div className="grow px-3 pb-2 pt-3">TÖB</div>
      </div>

      <div className="flex flex-col">
        {sortedStakeholdernotes.map((stakeholderNote) => {
          return (
            <StakeholderSectionListItem
              key={stakeholderNote.id}
              stakeholderNote={stakeholderNote}
            />
          )
        })}
      </div>
    </div>
  )
}

export default StakeholdernotesList
