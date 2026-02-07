import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import { useQuery } from "@blitzjs/rpc"
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/react"
import { clsx } from "clsx"
import { Route } from "next"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export const OperatorFilter = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const projectSlug = useProjectSlug()
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })

  if (!operators?.length) return null

  const currentOperator = searchParams?.get("operator") || ""

  return (
    <div className="mt-12">
      {/* <p>Planungsabschnitte anzeigen für:</p> */}
      <RadioGroup
        value={currentOperator}
        onChange={(value) => {
          const params = new URLSearchParams(searchParams?.toString() || "")
          if (value) {
            params.set("operator", value)
          } else {
            params.delete("operator")
          }
          router.push(`${pathname}?${params.toString()}` as Route, { scroll: false })
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
                className={({ active, checked }) =>
                  clsx(
                    active ? "" : "",
                    checked ? "bg-blue-900 text-white" : "bg-white ring-1 ring-gray-300",
                    "relative inline-flex items-center rounded-md px-3 py-2 text-sm whitespace-nowrap text-gray-900 ring-0 hover:cursor-pointer hover:ring-gray-600 focus:z-10",
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
