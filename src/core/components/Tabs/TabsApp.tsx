"use client"

import { Link } from "@/src/core/components/links"
import { clsx } from "clsx"
import { Route } from "next"

import { usePathname, useRouter } from "next/navigation"
import { startTransition } from "react"

type Tab = {
  name: string
  count?: number
  href: Route
}

type Props = {
  tabs: Tab[]
  className?: string
}

export const TabsApp = ({ tabs, className }: Props) => {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className={clsx(className, "mb-8")}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Unterseiten
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-gray-100 focus:ring-gray-500"
          defaultValue={tabs.find((tab) => pathname === tab.href)?.name}
          onChange={(event) => {
            const tab = tabs.find((tab) => tab.name === event.target.value)
            if (tab?.href) {
              startTransition(() => {
                router.push(tab.href)
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
            const current = pathname === tab.href

            return (
              <Link
                key={tab.name}
                href={tab.href}
                prefetch={true}
                className={clsx(
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
                      className={clsx(
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
