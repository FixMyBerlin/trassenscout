import { RouteUrlObject } from "blitz"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Link } from "../links"

type Tab = {
  name: string
  count?: number
  href: RouteUrlObject
}

type Props = { tabs: Tab[]; className?: string }

export const Tabs: React.FC<Props> = ({ tabs, className }) => {
  const router = useRouter()

  return (
    <nav className={className}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Unterseiten
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-gray-100 focus:ring-gray-500"
          defaultValue={tabs.find((tab) => router.pathname === tab.href.pathname)?.name}
          onChange={(event) => {
            const tab = tabs.find((tab) => tab.name === event.target.value)
            tab?.href && void router.push(tab?.href)
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:flex">
        <nav className="-mb-px flex" aria-label="Tabs">
          {tabs.map((tab) => {
            const current = router.pathname === tab.href.pathname
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={clsx(
                  current
                    ? "border-b-2 border-gray-900 !text-gray-900"
                    : "border-transparent border-b hover:border-gray-200 hover:text-gray-700",
                  "flex whitespace-nowrap py-3 px-3 text-sm font-medium"
                )}
                aria-current={current ? "page" : undefined}
              >
                {tab.name}
                {tab.count ? (
                  <span
                    className={clsx(
                      current ? "bg-gray-100 text-gray-500" : "bg-gray-200 text-gray-900",
                      "ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block"
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>
    </nav>
  )
}
