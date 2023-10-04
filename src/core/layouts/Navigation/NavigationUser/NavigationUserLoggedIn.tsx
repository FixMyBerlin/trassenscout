import { Routes, useParam } from "@blitzjs/next"
import { Menu, Transition } from "@headlessui/react"
import clsx from "clsx"
import React, { Fragment } from "react"
import { Link } from "src/core/components/links/Link"
import { CurrentUser } from "src/users/types"
import { getFullname, getInitials, isAdmin } from "src/users/utils"

type Props = {
  user: CurrentUser
}

export const NavigationUserLoggedIn: React.FC<Props> = ({ user }) => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button
            className={clsx(
              "flex rounded-full bg-blue-500 p-1",
              open ? "bg-blue-400" : "hover:bg-blue-400 focus:bg-blue-400",
            )}
          >
            <span className="sr-only">User-Menü</span>
            <div
              className="flex h-8 w-8 items-center justify-center text-lg font-semibold uppercase tracking-tighter text-gray-50"
              aria-hidden="true"
            >
              {getInitials(user)}
            </div>
          </Menu.Button>
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
              <Menu.Items
                static
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-gray-50 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="px-4 py-2 leading-6 text-gray-700">
                  <p>Angemeldet als</p>
                  <p className="truncate font-semibold">{getFullname(user) || "-"}</p>
                  <p className="mb-2 truncate">{user.email}</p>

                  {isAdmin(user) && <p className="font-semibold text-purple-700">Rolle: Admin</p>}
                </div>
                <div className="border-t border-gray-200 px-4 py-2 text-gray-700">
                  <div className="my-2 flex flex-col gap-4">
                    {projectSlug && (
                      <Menu.Item>
                        <Link
                          className="text-gray-500 decoration-blue-200 underline-offset-4 hover:text-blue-500 hover:underline"
                          href={Routes.EditUserPage({ projectSlug: projectSlug! })}
                        >
                          Ihr Profil
                        </Link>
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      <Link
                        className="text-gray-500 decoration-blue-200 underline-offset-4 hover:text-blue-500 hover:underline"
                        href={Routes.LogoutRedirectPage()}
                      >
                        Abmelden
                      </Link>
                    </Menu.Item>
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          )}
        </>
      )}
    </Menu>
  )
}
