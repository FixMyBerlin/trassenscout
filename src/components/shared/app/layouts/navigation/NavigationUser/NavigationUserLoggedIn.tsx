import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"
import { AdminBox } from "@/src/components/core/components/AdminBox/AdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import { getFullname } from "@/src/components/core/users/getFullname"
import { isDev, isProduction, isStaging } from "@/src/components/core/utils/isEnv"
import { getInitials } from "@/src/components/shared/app/users/utils/getInitials"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import type { CurrentUser } from "@/src/server/users/types"
import {
  navigationMenuItemLinkStyles,
  navigationMenuTransitionProps,
} from "../navigationMenuItemStyles"

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

                  {isAdmin(user) && (
                    <AdminBox label="Admin" compact className="divide-y divide-purple-200/70">
                      <p className="font-semibold">Rolle: Admin</p>
                      <pre className="overflow-x-auto text-[10px] leading-tight whitespace-pre-wrap">
                        {`Env: ${JSON.stringify({ isProduction, isStaging, isDev })}
VITE_APP_ENV: ${JSON.stringify(import.meta.env.VITE_APP_ENV)}
NODE_ENV: ${JSON.stringify(process.env.NODE_ENV)}`}
                      </pre>
                    </AdminBox>
                  )}
                </div>
                <div className="border-t border-gray-200 p-1.5 text-gray-700">
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
