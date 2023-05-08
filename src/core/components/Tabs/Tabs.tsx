import { RouteUrlObject } from "blitz"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Link } from "../links"

type Tab = {
  name: string
  href: RouteUrlObject
}

type Props = { tabs: Tab[]; className?: string }

export const Tabs: React.FC<Props> = ({ tabs, className }) => {
  const router = useRouter()

  return (
    <nav className={className}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
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
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const current = router.pathname === tab.href.pathname

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={clsx(
                  current
                    ? "cursor-default bg-gray-100 !text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                    : "",
                  "rounded-md px-3 py-2"
                )}
                aria-current={current ? "page" : undefined}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </nav>
  )
}
