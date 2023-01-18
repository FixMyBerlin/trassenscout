import { Routes } from "@blitzjs/next"
import { Menu, Transition } from "@headlessui/react"
import { UserIcon } from "@heroicons/react/24/solid"
import clsx from "clsx"
import React, { Fragment } from "react"
import { Link } from "src/core/components/links/Link"
import { CurrentUser } from "src/users/types"
import { getFullname, isAdmin } from "src/users/utils"

type Props = {
  user: CurrentUser
}

export const LoggedIn: React.FC<Props> = ({ user }) => {
  return (
    <Menu as="div" className="relative ml-3">
      {({ open }) => (
        <>
          <Menu.Button
            className={clsx(
              "flex rounded-full border-2 border-transparent bg-gray-800 p-1 text-sm",
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
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
                  <table className="mb-1">
                    <caption className="text-left font-bold">Angemeldet als…</caption>
                    <tr>
                      <th className="pr-2 text-left">E-Mail</th>
                      <td>{user.email}</td>
                    </tr>
                    <tr>
                      <th className="pr-2 text-left">Name</th>
                      <td>{getFullname(user) || "-"}</td>
                    </tr>
                    <tr>
                      <th className="pr-2 text-left">Tel</th>
                      <td>{user.phone || "-"}</td>
                    </tr>
                    {isAdmin(user) && (
                      <tr className="text-purple-700">
                        <th className="pr-2 text-left">Rolle</th>
                        <td>Admin</td>
                      </tr>
                    )}
                  </table>
                  <div className="mt-6 mb-4">
                    <Link href="#todo" button>
                      TODO Profil bearbeiten
                    </Link>
                  </div>
                </div>
                <Menu.Item>
                  <div className="mx-4 mt-6 mb-4">
                    <Link href={Routes.LogoutRedirectPage()}>Abmelden</Link>
                  </div>
                </Menu.Item>
              </Menu.Items>
            </Transition>
          )}
        </>
      )}
    </Menu>
  )
}
