import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getStakeholdernotes from "@/src/server/stakeholdernotes/queries/getStakeholdernotes"
import { Routes, useRouterQuery } from "@blitzjs/next"
import { PromiseReturnType } from "blitz"
import router from "next/router"
import { stakeholderNotesStatus } from "./stakeholdernotesStatus"

type Props = Pick<PromiseReturnType<typeof getStakeholdernotes>, "stakeholdernotes">

export const StakeholdernoteFilterDropdown: React.FC<Props> = ({ stakeholdernotes }) => {
  const params = useRouterQuery()
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()

  const options = Object.entries(stakeholderNotesStatus).map(([key, label]) => {
    const count = stakeholdernotes.filter((s) => s.status === key).length
    return { key, label, count }
  })

  if (!stakeholdernotes?.length) return null

  return (
    <div className="flex justify-end">
      <select
        id="stakeholderFilter"
        name="stakeholderFilter"
        value={params.stakeholderFilter || ""}
        onChange={(event) => {
          void router.push(
            Routes.SubsectionDashboardPage({
              projectSlug,
              subsectionSlug: subsectionSlug!,
              ...(event.target.value ? { stakeholderFilter: event.target.value } : {}),
            }),
            undefined,
            { scroll: false },
          )
        }}
        className="block w-80 text-ellipsis rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
      >
        <option key="" value="">
          Alles ({stakeholdernotes.length})
        </option>
        {options.map(({ key, label, count }) => {
          return (
            <option key={key} value={key}>
              {label} ({count})
            </option>
          )
        })}
      </select>
    </div>
  )
}
