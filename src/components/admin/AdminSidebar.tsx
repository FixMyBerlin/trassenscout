import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { ArrowTopRightOnSquareIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useMatchRoute } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import svgLogoTrassenscoutAdmin from "@/src/components/shared/app/layouts/assets/trassenscout-logo-admin-white.svg"
import { Img } from "@/src/components/shared/Img"
import { adminNavCountsQueryOptions } from "@/src/server/admin/adminNavCountsQueryOptions"
import type { AdminNavCounts } from "@/src/server/admin/types"
import {
  adminNavLinkOptions,
  buildAdminNavigation,
  buildAdminProjectNavigation,
  formatAdminNavCount,
  getAdminNavCount,
  isAdminNavItemActive,
  type AdminNavChild,
  type AdminNavItem,
  type AdminNavLink,
} from "./adminNavigation"

const navItemLinkClass =
  "group flex w-full items-center gap-x-3 rounded-md px-2 py-1.5 text-sm/5 font-semibold no-underline text-purple-100 hover:bg-purple-800 hover:text-white data-[status=active]:bg-purple-800 data-[status=active]:text-white"

const navSectionActiveClass = "bg-purple-800 text-white"

const navIconClass =
  "size-5 shrink-0 text-purple-200 group-data-[status=active]:text-white group-hover:text-white"

function NavCountBadge({ count }: { count: number | undefined }) {
  if (count === undefined) return null
  return (
    <span
      aria-hidden="true"
      className="ml-auto w-9 min-w-max rounded-full bg-purple-600 px-2.5 py-0.5 text-center text-xs/5 font-medium whitespace-nowrap text-white outline-1 -outline-offset-1 outline-purple-500"
    >
      {formatAdminNavCount(count)}
    </span>
  )
}

function AdminNavLeafLink({
  link,
  name,
  count,
  external,
}: {
  link: AdminNavLink
  name: string
  count?: number
  external?: true
}) {
  return (
    <Link
      className={navItemLinkClass}
      {...adminNavLinkOptions(link)}
      preload={external ? false : undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <span className="truncate">{name}</span>
      {external ? (
        <>
          <ArrowTopRightOnSquareIcon
            aria-hidden
            className="ml-auto size-3.5 shrink-0 text-purple-300 group-hover:text-white"
          />
          <span className="sr-only"> (neues Fenster)</span>
        </>
      ) : (
        <NavCountBadge count={count} />
      )}
    </Link>
  )
}

function AdminNavChildLinks({
  items,
  counts,
  matchRoute,
}: {
  items: AdminNavChild[]
  counts: AdminNavCounts
  matchRoute: ReturnType<typeof useMatchRoute>
}) {
  return (
    <>
      {items.map((child) => {
        if (child.children?.length) {
          const childActive = isAdminNavItemActive(matchRoute, child)
          return (
            <li key={child.link ? `${child.name}-${child.link.to}` : child.name}>
              <Disclosure as="div" className="w-full" defaultOpen={childActive}>
                <DisclosureButton
                  className={twJoin(
                    navItemLinkClass,
                    childActive && navSectionActiveClass,
                    "text-left",
                  )}
                >
                  <span className="truncate">{child.name}</span>
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="ml-auto size-5 shrink-0 text-purple-200 group-data-open:rotate-90 group-data-open:text-white"
                  />
                </DisclosureButton>
                <DisclosurePanel as="ul" className="mt-1 space-y-0.5 pl-4">
                  <AdminNavChildLinks
                    items={child.children}
                    counts={counts}
                    matchRoute={matchRoute}
                  />
                </DisclosurePanel>
              </Disclosure>
            </li>
          )
        }

        if (!child.link) return null

        return (
          <li key={child.link ? `${child.name}-${child.link.to}` : child.name}>
            <AdminNavLeafLink
              link={child.link}
              name={child.name}
              count={getAdminNavCount(counts, child.countKey)}
              external={child.external}
            />
          </li>
        )
      })}
    </>
  )
}

function AdminNavItemRow({
  item,
  counts,
  matchRoute,
}: {
  item: AdminNavItem
  counts: AdminNavCounts
  matchRoute: ReturnType<typeof useMatchRoute>
}) {
  const active = isAdminNavItemActive(matchRoute, item)
  const count = getAdminNavCount(counts, item.countKey)
  const Icon = item.icon

  if (item.children?.length) {
    return (
      <Disclosure as="div" className="w-full" defaultOpen={active}>
        <DisclosureButton
          className={twJoin(navItemLinkClass, active ? navSectionActiveClass : "", "text-left")}
        >
          {Icon && <Icon aria-hidden="true" className={navIconClass} />}
          {item.name}
          <ChevronRightIcon
            aria-hidden="true"
            className="ml-auto size-5 shrink-0 text-purple-200 group-data-open:rotate-90 group-data-open:text-white"
          />
        </DisclosureButton>
        <DisclosurePanel as="ul" className="mt-1 px-2">
          <AdminNavChildLinks items={item.children} counts={counts} matchRoute={matchRoute} />
        </DisclosurePanel>
      </Disclosure>
    )
  }

  if (!item.link) return null

  return (
    <Link
      className={navItemLinkClass}
      {...adminNavLinkOptions(item.link)}
      preload={item.external ? false : undefined}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
    >
      {Icon && <Icon aria-hidden="true" className={navIconClass} />}
      <span className="truncate">{item.name}</span>
      {item.external ? (
        <>
          <ArrowTopRightOnSquareIcon
            aria-hidden
            className="ml-auto size-3.5 shrink-0 text-purple-300 group-hover:text-white"
          />
          <span className="sr-only"> (neues Fenster)</span>
        </>
      ) : (
        <NavCountBadge count={count} />
      )}
    </Link>
  )
}

export function AdminSidebar() {
  const { data: counts } = useSuspenseQuery(adminNavCountsQueryOptions())
  const projectSlug = useTryRouteParam("projectSlug")
  const matchRoute = useMatchRoute()
  const navigation = buildAdminNavigation()

  return (
    <div className="relative flex w-72 shrink-0 flex-col gap-y-5 overflow-y-auto bg-purple-700 px-6 pb-20">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-end">
          <Img src={svgLogoTrassenscoutAdmin} alt="Trassenscout" height={30} width={84} />
        </div>
      </div>
      <nav className="flex flex-1 flex-col pb-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-0.5">
              {navigation.map((item) => (
                <li key={item.name} className="w-full">
                  <AdminNavItemRow item={item} counts={counts} matchRoute={matchRoute} />
                </li>
              ))}
            </ul>
          </li>
          {projectSlug ? (
            <li>
              <div className="text-xs/6 font-semibold text-purple-300">
                Projekt: {shortTitle(projectSlug)}
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-0.5">
                <AdminNavChildLinks
                  items={buildAdminProjectNavigation(projectSlug)}
                  counts={counts}
                  matchRoute={matchRoute}
                />
              </ul>
            </li>
          ) : null}
        </ul>
      </nav>
    </div>
  )
}
