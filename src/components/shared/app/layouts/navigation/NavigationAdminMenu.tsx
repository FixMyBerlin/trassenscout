import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { ArrowTopRightOnSquareIcon, EllipsisHorizontalIcon } from "@heroicons/react/20/solid"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"
import {
  adminNavLinkOptions,
  adminQuickNavLinkKey,
  buildAdminQuickNavMenu,
  type AdminQuickNavLink,
} from "@/src/components/admin/adminNavigation"
import { Link } from "@/src/components/core/components/links/Link"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import {
  adminNavigationMenuItemLinkStyles,
  navigationMenuTransitionProps,
} from "./navigationMenuItemStyles"

function NavigationAdminMenuLink({ item, focus }: { item: AdminQuickNavLink; focus: boolean }) {
  const navigate = useNavigate()
  const classNameOverwrites = twJoin(
    adminNavigationMenuItemLinkStyles(focus),
    "flex w-full cursor-pointer items-center gap-2 text-left",
  )
  const link = adminNavLinkOptions(item.link)

  // External links keep `<a target="_blank">`. Internal links use a button + navigate so
  // Headless UI unmounting the menu on close cannot abort the in-flight route change.
  if (item.external) {
    return (
      <Link {...link} blank classNameOverwrites={classNameOverwrites}>
        <span className="truncate">{item.name}</span>
        <ArrowTopRightOnSquareIcon
          aria-hidden
          className="ml-auto size-3.5 shrink-0 text-purple-400"
        />
        <span className="sr-only"> (neues Fenster)</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={classNameOverwrites}
      onClick={() => {
        void navigate(link)
      }}
    >
      <span className="truncate">{item.name}</span>
    </button>
  )
}

function NavigationAdminMenuSection({
  links,
  title,
}: {
  links: AdminQuickNavLink[]
  title?: string
}) {
  return (
    <div className="space-y-1">
      {title ? (
        <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold tracking-wide text-purple-700 uppercase">
          {title}
        </p>
      ) : null}
      {links.map((item) => (
        <MenuItem key={adminQuickNavLinkKey(item)}>
          {({ focus }) => <NavigationAdminMenuLink item={item} focus={focus} />}
        </MenuItem>
      ))}
    </div>
  )
}

export const NavigationAdminMenu = () => {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())
  const projectSlug = useTryRouteParam("projectSlug")

  if (!isAdmin(user)) return null

  const adminMenu = buildAdminQuickNavMenu(projectSlug)

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            className={twJoin(
              "relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-purple-700 text-white hover:bg-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
              open ? "bg-purple-600" : "",
            )}
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Admin-Links</span>
            <EllipsisHorizontalIcon className="size-7" aria-hidden="true" />
          </MenuButton>
          <Transition show={open} as={Fragment} {...navigationMenuTransitionProps}>
            <MenuItems
              static
              modal={false}
              anchor="bottom end"
              className="z-20 mt-2 max-h-[min(32rem,var(--anchor-max-height,100vh))] w-72 max-w-[calc(100vw-2rem)] origin-top-right overflow-y-auto rounded-md border border-purple-200/80 bg-purple-50/95 p-2 text-purple-950 shadow-lg ring-1 ring-purple-200/60 focus:outline-hidden"
            >
              <NavigationAdminMenuSection links={adminMenu.global} />
              {adminMenu.project ? (
                <div className="mt-2 border-t border-purple-200/70 pt-2">
                  <NavigationAdminMenuSection
                    title={`Projekt: ${adminMenu.project.title}`}
                    links={adminMenu.project.links}
                  />
                </div>
              ) : null}
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  )
}
