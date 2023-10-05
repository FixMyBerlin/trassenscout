import { Routes, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { RadioGroup } from "@headlessui/react"
import clsx from "clsx"
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
    <div className="mt-12">
      {/* <p>Planungsabschnitte anzeigen für:</p> */}
      <RadioGroup
        value={params.operator || ""}
        onChange={(value) => {
          void router.push(
            Routes.ProjectDashboardPage({
              projectSlug: projectSlug!,
              ...(value ? { operator: value } : {}),
            }),
            undefined,
            { scroll: false },
          )
        }}
        className="mt-2"
      >
        <RadioGroup.Label className="sr-only">Baulastträger auswählen</RadioGroup.Label>
        <div className="space-x-2">
          <RadioGroup.Option
            value=""
            className={({ active, checked }) =>
              clsx(
                active ? "" : "",
                checked ? "bg-blue-900 text-white" : "ring-1 ring-gray-300 bg-white",
                "hover:cursor-pointer ring-0 hover:ring-gray-600 whitespace-nowrap relative inline-flex items-center rounded-md px-3 py-2 text-sm text-gray-900 focus:z-10",
              )
            }
          >
            <RadioGroup.Label as="span" className="font-semibold">
              Alle Baulastträger
            </RadioGroup.Label>
          </RadioGroup.Option>
          {operators.map((operator) => (
            <RadioGroup.Option
              key={operator.id}
              value={operator.slug}
              className={({ active, checked }) =>
                clsx(
                  active ? "" : "",
                  checked ? "bg-blue-900 text-white" : "ring-1 ring-gray-300 bg-white",
                  "hover:cursor-pointer ring-0 hover:ring-gray-600 whitespace-nowrap relative inline-flex items-center rounded-md px-3 py-2 text-sm text-gray-900 focus:z-10",
                )
              }
            >
              <RadioGroup.Label className="uppercase font-semibold" as="span">
                {operator.slug}
              </RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
