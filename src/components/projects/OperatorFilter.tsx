import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/")

export const OperatorFilter = () => {
  const navigate = routeApi.useNavigate()
  const { projectSlug } = routeApi.useParams()
  const { operator } = routeApi.useSearch()
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const currentOperator = operator || ""

  return (
    <div>
      <RadioGroup
        value={currentOperator}
        onChange={(value) => {
          void navigate({
            search: (previous) => ({ ...previous, operator: value || undefined }),
            resetScroll: false,
          })
        }}
      >
        <RadioGroupLabel className="sr-only">Baulastträger auswählen</RadioGroupLabel>
        <div className="flex flex-wrap gap-2">
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
          {project.operators.map((operator) => (
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
