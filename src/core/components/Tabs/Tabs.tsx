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
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-gray-100 focus:ring-gray-500"
          defaultValue={
            tabs.find(
              (tab) =>
                router.pathname === tab.href.pathname &&
                JSON.stringify(router.query) === JSON.stringify(tab.href.query)
            )?.name
          }
          onChange={(event) => {
            const tab = tabs.find((tab) => tab.name === event.target.value)
            tab?.href && void router.push(tab?.href)
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
            // This is a hacky way to compare an unkown set of query params. But it seems to work…
            const current =
              router.pathname === tab.href.pathname &&
              JSON.stringify(router.query) === JSON.stringify(tab.href.query)

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={clsx(
                  current
                    ? "border-b-2 border-gray-900 !text-gray-900"
                    : "border-b border-transparent hover:border-gray-200 hover:text-gray-700",
                  "flex px-3 py-3 text-sm font-medium"
                )}
                aria-current={current ? "page" : undefined}
              >
                {tab.name}
                {typeof tab.count !== "undefined" && (
                  <div>
                    <span
                      className={clsx(
                        current ? "bg-gray-100 text-gray-500" : "bg-gray-200 text-gray-900",
                        "ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block"
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
