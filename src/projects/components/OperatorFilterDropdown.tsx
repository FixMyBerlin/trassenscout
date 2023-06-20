import { Routes, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import router from "next/router"
import React from "react"
import { useSlugs } from "src/core/hooks"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"

export const OperatorFilterDropdown: React.FC = () => {
  const params = useRouterQuery()
  const { projectSlug } = useSlugs()
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })

  if (!operators?.length) return null

  return (
    <div className="mt-12 flex justify-end">
      <select
        id="operator"
        name="operator"
        value={params.operator || ""}
        onChange={(event) => {
          void router.push(
            Routes.ProjectDashboardPage({
              projectSlug: projectSlug!,
              ...(event.target.value ? { operator: event.target.value } : {}),
            }),
            undefined,
            { scroll: false }
          )
        }}
        className="block w-80 text-ellipsis rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
      >
        <option key="" value="">
          Planungsabschnitte aller Baulastträger
        </option>
        {operators.map(({ slug, title, subsectionCount }) => {
          return (
            <option key={slug} value={slug}>
              Planungsabschnitte ({subsectionCount}) für {title} ({slug})
            </option>
          )
        })}
      </select>
    </div>
  )
}
