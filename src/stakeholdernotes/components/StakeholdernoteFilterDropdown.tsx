import { Routes, useRouterQuery } from "@blitzjs/next"
import { StakeholdernoteStatusEnum } from "@prisma/client"
import { PromiseReturnType } from "blitz"
import router from "next/router"
import React from "react"
import { useSlugs } from "src/core/hooks"
import getStakeholdernotes from "../queries/getStakeholdernotes"

type Props = Pick<PromiseReturnType<typeof getStakeholdernotes>, "stakeholdernotes">

export const StakeholdernoteFilterDropdown: React.FC<Props> = ({ stakeholdernotes }) => {
  const params = useRouterQuery()
  const { projectSlug, subsectionSlug } = useSlugs()

  const options = Object.keys(StakeholdernoteStatusEnum).map((key) => {
    const count = stakeholdernotes.filter((s) => s.status === key).length
    return { key, count }
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
              projectSlug: projectSlug!,
              subsectionSlug: subsectionSlug!,
              ...(event.target.value ? { stakeholderFilter: event.target.value } : {}),
            }),
            undefined,
            { scroll: false }
          )
        }}
        className="block w-80 text-ellipsis rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
      >
        <option key="" value="">
          Alles ({stakeholdernotes.length})
        </option>
        {options.map(({ key, count }) => {
          return (
            <option key={key} value={key}>
              {key} ({count})
            </option>
          )
        })}
      </select>
    </div>
  )
}
