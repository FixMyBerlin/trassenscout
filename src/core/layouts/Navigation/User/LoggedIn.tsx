import { Routes } from "@blitzjs/next"
import { Menu, Transition } from "@headlessui/react"
import { UserIcon } from "@heroicons/react/24/solid"
import React, { Fragment } from "react"
import { Link } from "src/core/components/links/Link"
// import { User } from "@prisma/client" --> dann fehlen hier createdAt etc.

type Props = {
  user: { id: number; role?: string; name?: string | null; email: string }
}

export const LoggedIn: React.FC<Props> = ({ user }) => {
  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button className="flex rounded-full bg-gray-800 text-sm hover:ring-1 hover:ring-gray-500 hover:ring-offset-2 hover:ring-offset-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
        <span className="sr-only">User-Menü</span>
        <UserIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
            <p className="mb-1">
              <strong>Angemeldet als {user.name ? user.name : user.email}</strong>
            </p>
            <div className="mt-6 mb-4">
              <Link href="#" button>
                Zu meinem Profil
              </Link>
            </div>
          </div>
          <Menu.Item>
            <div className="mx-4 mt-6 mb-4">
              <Link href={Routes.LogoutRedirectPage()} button>
                Abmelden
              </Link>
            </div>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
