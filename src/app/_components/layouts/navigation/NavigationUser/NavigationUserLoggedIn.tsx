"use client"
import { AdminBox } from "@/src/core/components/AdminBox/AdminBox"
import { Link } from "@/src/core/components/links/Link"
import { linkStyles } from "@/src/core/components/links/styles"
import { useTryProjectSlug } from "@/src/core/routes/useProjectSlug"
import {
  showMembershipRoleCheckIndicatorCountActions,
  showMembershipRoleCheckIndicatorState,
} from "@/src/core/store/showMembershipRoleCheckIndicator.zustand"
import { isDev, isProduction, isStaging } from "@/src/core/utils/isEnv"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import { getInitials } from "@/src/pagesComponents/users/utils/getInitials"
import { isAdmin } from "@/src/pagesComponents/users/utils/isAdmin"
import { CurrentUser } from "@/src/server/users/types"
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { clsx } from "clsx"
import { Fragment } from "react"

type Props = {
  user: CurrentUser
}

export const NavigationUserLoggedIn = ({ user }: Props) => {
  const projectSlug = useTryProjectSlug()
  const showMembershipRoleCheckIndicator = showMembershipRoleCheckIndicatorState()
  const { toggleShowMembershipRoleCheckIndicator } = showMembershipRoleCheckIndicatorCountActions()

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            className={clsx(
              "flex rounded-full bg-blue-500 p-1",
              open ? "bg-blue-400" : "hover:bg-blue-400 focus:bg-blue-400",
            )}
          >
            <span className="sr-only">User-Menü</span>
            <div
              className="flex h-8 w-8 items-center justify-center text-lg font-semibold tracking-tighter text-gray-50 uppercase"
              aria-hidden="true"
            >
              {getInitials(user)}
            </div>
          </MenuButton>
          {open && (
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems
                static
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
                    <AdminBox label="Admin" className="divide-y divide-purple-300">
                      <p className="font-semibold">Rolle: Admin</p>
                      <button
                        onClick={toggleShowMembershipRoleCheckIndicator}
                        className={clsx(linkStyles, "text-left leading-none")}
                      >
                        {showMembershipRoleCheckIndicator ? "AN" : "AUS"}: Hervorheben, wo Element
                        abhängig von der Editor-Rolle angezeigt werden.
                      </button>
                      <pre className="text-xs">
                        Env: {JSON.stringify({ isProduction, isStaging, isDev }, undefined, 2)}
                        <br />
                        NEXT_PUBLIC_APP_ENV: {JSON.stringify(process.env.NEXT_PUBLIC_APP_ENV)}
                        <br />
                        NODE_ENV: {JSON.stringify(process.env.NODE_ENV)}
                      </pre>
                    </AdminBox>
                  )}
                </div>
                <div className="border-t border-gray-200 px-4 py-2 text-gray-700">
                  <div className="my-2 flex flex-col gap-4">
                    <MenuItem>
                      <Link
                        className="text-gray-500 decoration-blue-200 underline-offset-4 hover:text-blue-500 hover:underline"
                        href="/user/edit"
                      >
                        Ihr Profil
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        className="text-gray-500 decoration-blue-200 underline-offset-4 hover:text-blue-500 hover:underline"
                        href="/auth/logout"
                      >
                        Abmelden
                      </Link>
                    </MenuItem>
                  </div>
                </div>
              </MenuItems>
            </Transition>
          )}
        </>
      )}
    </Menu>
  )
}
