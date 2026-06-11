import { useLocation, useNavigate } from "@tanstack/react-router"
import { startTransition } from "react"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"

type Tab = {
  name: string
  count?: number
  to: string
}

type Props = {
  tabs: Tab[]
  className?: string
}

export const TabsApp = ({ tabs, className }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  return (
    <nav className={twJoin(className, "mb-8")}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Unterseiten
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-gray-100 focus:ring-gray-500"
          defaultValue={tabs.find((tab) => pathname === tab.to)?.name}
          onChange={(event) => {
            const tab = tabs.find((tab) => tab.name === event.target.value)
            if (tab?.to) {
              startTransition(() => {
                void navigate({ to: tab.to })
              })
            }
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>
              {tab.name} {tab.count ? `(${tab.count})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:flex">
        <nav className="-mb-px flex w-full" aria-label="Tabs">
          {tabs.map((tab) => {
            const current = pathname === tab.to

            return (
              <Link
                key={tab.name}
                to={tab.to}
                preload="intent"
                className={twJoin(
                  current
                    ? "border-b-2 border-gray-900 text-gray-900!"
                    : "border-b border-transparent hover:border-gray-300 hover:text-gray-700",
                  "flex px-3 py-3 text-sm font-medium",
                )}
                aria-current={current ? "page" : undefined}
              >
                {tab.name}
                {typeof tab.count !== "undefined" && (
                  <div>
                    <span
                      className={twJoin(
                        current ? "bg-gray-100 text-gray-500" : "bg-gray-200 text-gray-900",
                        "ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block",
                      )}
                    >
                      {tab.count}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </nav>
  )
}
