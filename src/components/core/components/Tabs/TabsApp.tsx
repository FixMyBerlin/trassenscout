import { useLocation, useNavigate } from "@tanstack/react-router"
import { startTransition } from "react"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { pillShellClasses } from "@/src/components/core/utils/pillClassNames"

type Tab = {
  name: string
  count?: number
  to: string
  /** When true, tab stays active on nested routes under `to` (e.g. list + map). */
  activeForSubpaths?: boolean
}

function isTabActive(pathname: string, tab: Tab) {
  if (pathname === tab.to) return true
  if (!tab.activeForSubpaths) return false
  return pathname.startsWith(`${tab.to}/`)
}

type Props = {
  tabs: Tab[]
  className?: string
  embedded?: boolean
}

export const TabsApp = ({ tabs, className, embedded = false }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  return (
    <nav className={twJoin(className, embedded ? undefined : "mb-8")}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Unterseiten
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-gray-100 focus:ring-gray-500"
          defaultValue={tabs.find((tab) => isTabActive(pathname, tab))?.name}
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
            const current = isTabActive(pathname, tab)

            return (
              <Link
                key={tab.name}
                to={tab.to}
                preload="intent"
                className={twJoin(
                  current
                    ? "border-b-2 border-gray-900 font-semibold text-gray-900!"
                    : "border-b border-transparent text-blue-700 hover:border-gray-300 hover:text-blue-800",
                  embedded ? "flex h-12 items-center px-3 text-sm" : "flex px-3 py-3 text-sm",
                )}
                aria-current={current ? "page" : undefined}
              >
                {tab.name}
                {typeof tab.count !== "undefined" && (
                  <div>
                    <span
                      className={twJoin(
                        current ? "bg-gray-100 text-gray-500" : "bg-gray-200 text-gray-900",
                        pillShellClasses,
                        "ml-3 hidden text-xs md:inline-block",
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
