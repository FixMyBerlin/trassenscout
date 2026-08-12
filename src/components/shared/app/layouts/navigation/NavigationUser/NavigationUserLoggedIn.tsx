import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { getFullname } from "@/src/components/core/users/getFullname"
import { getInitials } from "@/src/components/shared/app/users/utils/getInitials"
import type { CurrentUser } from "@/src/server/users/types"
import {
  navigationMenuItemLinkStyles,
  navigationMenuTransitionProps,
} from "../navigationMenuItemStyles"
import { NavigationMenuSeparator } from "../NavigationMenuSeparator"

type Props = {
  user: CurrentUser
}

export const NavigationUserLoggedIn = ({ user }: Props) => {
  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            className={twJoin(
              "relative flex max-w-xs cursor-pointer items-center rounded-full bg-blue-500 p-1 hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
              open ? "bg-blue-400" : "",
            )}
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">User-Menü</span>
            <div
              className="flex size-8 items-center justify-center text-lg font-semibold tracking-tighter text-gray-50 uppercase"
              aria-hidden="true"
            >
              {getInitials(user)}
            </div>
          </MenuButton>
          {open && (
            <Transition as={Fragment} {...navigationMenuTransitionProps}>
              <MenuItems
                modal={false}
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-gray-50 py-1 shadow-lg ring-1 ring-gray-200/5 focus:outline-hidden"
              >
                <div className="px-4 py-2 leading-6 text-gray-700">
                  <p className="mb-2 text-xs text-gray-400">Angemeldet als</p>
                  <p className="truncate font-semibold">{getFullname(user) || "-"}</p>
                  <p className="mb-2 truncate">{user.email}</p>
                  {user.institution && (
                    <p className="mb-2 truncate text-xs text-gray-400">{user.institution}</p>
                  )}
                </div>
                <NavigationMenuSeparator />
                <div className="p-1.5 text-gray-700">
                  <MenuItem>
                    {({ focus }) => (
                      <Link
                        to="/user/edit"
                        classNameOverwrites={navigationMenuItemLinkStyles(focus)}
                      >
                        Ihr Profil
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <Link
                        to="/auth/logout"
                        classNameOverwrites={navigationMenuItemLinkStyles(focus)}
                      >
                        Abmelden
                      </Link>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          )}
        </>
      )}
    </Menu>
  )
}
