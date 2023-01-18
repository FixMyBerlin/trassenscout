import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Link } from "src/core/components/links"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import { StakeholderItem } from "./StakeholderItem"

export const StakeholdernotesList = () => {
  const router = useRouter()
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, {
    orderBy: { id: "asc" },
  })

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
    <div className="mb-12">
      <h3 className="mb-10 text-2xl font-bold">Stakeholderliste und Status der Abstimmung</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </div>
    </div>
  )
}

export default StakeholdernotesList
