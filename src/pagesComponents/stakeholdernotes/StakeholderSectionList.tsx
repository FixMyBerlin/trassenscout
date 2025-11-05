import { useRouterQuery } from "@blitzjs/next"
import { Stakeholdernote } from "@prisma/client"
import { clsx } from "clsx"
import { useEffect, useRef } from "react"
import { StakeholderSectionListItem } from "./StakeholderSectionListItem"

type props = {
  stakeholdernotes: Stakeholdernote[]
}

export const StakeholdernotesList: React.FC<props> = ({ stakeholdernotes }) => {
  // Handle scroll into view on page load (like a hash URL) based on a ref and URL param `stakeholderDetails`.
  // The ref is an error of listItems where the array index is the stakeholderNote.id.
  const params = useRouterQuery()
  const paramsStakeholderDetails = parseInt(String(params.stakeholderDetails))
  const disclosureRefs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    if (paramsStakeholderDetails) {
      const currentRef = disclosureRefs.current?.at(paramsStakeholderDetails)
      currentRef?.scrollIntoView({ behavior: "smooth" })
    }
  }, [paramsStakeholderDetails])

  // Manually sort the entries
  const stakeholdersDone = stakeholdernotes.filter(
    (stakeholdernotes) => stakeholdernotes.status === "DONE",
  )
  const stakeholdersPending = stakeholdernotes.filter(
    (stakeholdernotes) => stakeholdernotes.status === "PENDING",
  )
  const stakeholdersIrrelevant = stakeholdernotes.filter(
    (stakeholdernotes) => stakeholdernotes.status === "IRRELEVANT",
  )
  const stakeholdersInProgress = stakeholdernotes.filter(
    (stakeholdernotes) => stakeholdernotes.status === "IN_PROGRESS",
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
    <div className="not-prose ring-opacity-5 overflow-hidden shadow-sm ring-1 ring-gray-200 md:rounded-lg">
      <div className="flex border-b border-gray-100 text-xs text-gray-500 uppercase">
        <div className="w-64 pt-3 pr-3 pb-2 pl-4 sm:pl-6">Status</div>
        <div className="grow px-3 pt-3 pb-2">TÖB</div>
      </div>

      <div className="flex flex-col">
        {sortedStakeholdernotes.map((stakeholderNote) => {
          return (
            <div
              key={stakeholderNote.id}
              // I tried passing the ref as forwardRef but that did not work for unknown reasons.
              // @ts-expect-error TODO: this erros since we updated packages; we need to re-test this and maybe remove the feature?
              ref={(element) => (disclosureRefs.current[stakeholderNote.id] = element)}
              className={clsx(
                "scroll-m-0",
                // stakeholderNote.id == paramsStakeholderDetails && "bg-yellow-50"
              )}
            >
              <StakeholderSectionListItem stakeholderNote={stakeholderNote} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StakeholdernotesList
