import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getOperatorsWithCount from "@/src/operators/queries/getOperatorsWithCount"
import { Routes, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/react"
import { clsx } from "clsx"
import router from "next/router"

export const OperatorFilterDropdown = () => {
  const params = useRouterQuery()
  const projectSlug = useProjectSlug()
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
              projectSlug,
              ...(value ? { operator: value } : {}),
            }),
            undefined,
            { scroll: false },
          )
        }}
        className="mt-2"
      >
        <RadioGroupLabel className="sr-only">Baulastträger auswählen</RadioGroupLabel>
        <div className="space-x-2">
          <RadioGroupOption
            value=""
            className={({ active, checked }) =>
              clsx(
                active ? "" : "",
                checked ? "bg-blue-900 text-white" : "bg-white ring-1 ring-gray-300",
                "relative inline-flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm text-gray-900 ring-0 hover:cursor-pointer hover:ring-gray-600 focus:z-10",
              )
            }
          >
            <RadioGroupLabel as="span" className="font-semibold">
              Alle Baulastträger
            </RadioGroupLabel>
          </RadioGroupOption>
          {operators.map((operator) => (
            <RadioGroupOption
              key={operator.id}
              value={operator.slug}
              className={({ active, checked }) =>
                clsx(
                  active ? "" : "",
                  checked ? "bg-blue-900 text-white" : "bg-white ring-1 ring-gray-300",
                  "relative inline-flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm text-gray-900 ring-0 hover:cursor-pointer hover:ring-gray-600 focus:z-10",
                )
              }
            >
              <RadioGroupLabel className="font-semibold" as="span">
                {shortTitle(operator.slug)}
              </RadioGroupLabel>
            </RadioGroupOption>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
