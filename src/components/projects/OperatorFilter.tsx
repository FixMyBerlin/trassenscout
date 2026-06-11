import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useLocation, useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export const OperatorFilter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const searchParams = new URLSearchParams(location.searchStr)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "operators" }),
  )
  const operators = (data.rows ?? []) as unknown as Array<{
    id: number
    slug: string
    subsectionCount: number
  }>

  if (!operators.length) return null

  const currentOperator = searchParams.get("operator") || ""

  return (
    <div>
      <RadioGroup
        value={currentOperator}
        onChange={(value) => {
          const params = new URLSearchParams(location.searchStr)
          if (value) {
            params.set("operator", value)
          } else {
            params.delete("operator")
          }
          const search = params.toString()
          void navigate({
            to: search ? `${location.pathname}?${search}` : location.pathname,
          })
        }}
      >
        <RadioGroupLabel className="sr-only">Baulastträger auswählen</RadioGroupLabel>
        <div className="space-x-2">
          <RadioGroupOption
            value=""
            className={({ checked }) =>
              twJoin(
                checked ? "bg-blue-900 text-white" : "bg-white ring-1 ring-gray-300",
                "relative inline-flex items-center rounded-md px-3 py-2 text-sm whitespace-nowrap text-gray-900 ring-0 hover:cursor-pointer hover:ring-gray-600 focus:z-10",
              )
            }
          >
            <RadioGroupLabel as="span" className="font-semibold">
              Alle Baulastträger
            </RadioGroupLabel>
          </RadioGroupOption>
          {operators
            .filter((operator) => operator.subsectionCount > 0)
            .map((operator) => (
              <RadioGroupOption
                key={operator.id}
                value={operator.slug}
                className={({ checked }) =>
                  twJoin(
                    checked
                      ? "bg-blue-900 text-white ring-0"
                      : "bg-white text-gray-900 ring-1 ring-gray-300",
                    "relative inline-flex items-center rounded-md px-3 py-2 text-sm whitespace-nowrap hover:cursor-pointer hover:ring-gray-600 focus:z-10",
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
