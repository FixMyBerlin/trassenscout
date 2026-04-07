"use client"

import { Link } from "@/src/core/components/links"
import {
  subsubsectionDashboardRoute,
  subsubsectionLandAcquisitionRoute,
} from "@/src/core/routes/subsectionRoutes"
import { clsx } from "clsx"
import { Route } from "next"
import { usePathname, useRouter } from "next/navigation"
import { startTransition } from "react"

export type SubsubsectionTabKey = "general" | "land-acquisition"

type Tab = {
  name: string
  href: Route
}

type Props = {
  projectSlug: string
  subsectionSlug: string
  subsubsectionSlug: string
  showLandAcquisitionTab: boolean
}

export const SubsubsectionTabs = ({
  projectSlug,
  subsectionSlug,
  subsubsectionSlug,
  showLandAcquisitionTab,
}: Props) => {
  const pathname = usePathname()
  const router = useRouter()

  const tabs: Tab[] = [
    {
      name: "Allgemeines",
      href: subsubsectionDashboardRoute(projectSlug, subsectionSlug, subsubsectionSlug),
    },
    ...(showLandAcquisitionTab
      ? [
          {
            name: "Grunderwerb",
            href: subsubsectionLandAcquisitionRoute(projectSlug, subsectionSlug, subsubsectionSlug),
          },
        ]
      : []),
  ]

  if (tabs.length <= 1) {
    return null
  }

  return (
    <nav className="mt-8 mb-6 max-w-md">
      <div className="sm:hidden">
        <label htmlFor="subsubsection-tabs" className="sr-only">
          Unterseiten
        </label>
        <select
          id="subsubsection-tabs"
          name="subsubsection-tabs"
          className="block w-full rounded-md border-gray-300 focus:border-gray-100 focus:ring-gray-500"
          defaultValue={tabs.find((tab) => pathname === tab.href)?.name}
          onChange={(event) => {
            const tab = tabs.find((item) => item.name === event.target.value)
            if (tab?.href) {
              startTransition(() => {
                router.push(tab.href)
              })
            }
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <div className="flex items-start gap-6">
          {tabs.map((tab) => {
            const current = pathname === tab.href

            return (
              <Link
                key={tab.name}
                href={tab.href}
                prefetch={true}
                aria-current={current ? "page" : undefined}
                className={clsx(
                  current ? "border-gray-900 text-gray-900!" : "border-transparent text-blue-500",
                  "border-b-2 px-1 pb-2 text-sm font-semibold",
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
