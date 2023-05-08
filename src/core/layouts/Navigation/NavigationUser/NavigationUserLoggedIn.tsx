import { Routes, useParam } from "@blitzjs/next"
import { Menu, Transition } from "@headlessui/react"
import { UserIcon } from "@heroicons/react/24/solid"
import clsx from "clsx"
import React, { Fragment } from "react"
import { LinkMail } from "src/core/components/links"
import { Link } from "src/core/components/links/Link"
import { CurrentUser } from "src/users/types"
import { getFullname, isAdmin } from "src/users/utils"

type Props = {
  user: CurrentUser
}

export const NavigationUserLoggedIn: React.FC<Props> = ({ user }) => {
  const projectSlug = useParam("projectSlug", "string")
  return (
    <Menu as="div" className="relative ml-3">
      {({ open }) => (
        <>
          <Menu.Button
            className={clsx(
              "border-transparent flex rounded-full border-2 bg-gray-800 p-1 text-sm",
              open
                ? "border-offset-gray-800 border-2 border-white"
                : "hover:border-offset-gray-800 hover:border-2 hover:border-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-white/30"
            )}
          >
            <span className="sr-only">User-Menü</span>
            <UserIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
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
                <div className="px-4 py-2 text-gray-700">
                  <p>Angemeldet als</p>
                  <p className="font-bold">{getFullname(user) || "-"}</p>
                  <p className="mb-2 font-bold">{user.email}</p>

                  {isAdmin(user) && <p className="font-bold text-purple-700">Rolle: Admin</p>}

                  <div className="mt-6 mb-4 flex flex-col gap-4">
                    {projectSlug && (
                      <Menu.Item>
                        <Link
                          className=" !text-gray-500"
                          href={Routes.EditUserPage({ projectSlug: projectSlug! })}
                        >
                          Ihr Profil
                        </Link>
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      <Link className=" !text-gray-500" href={Routes.LogoutRedirectPage()}>
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
