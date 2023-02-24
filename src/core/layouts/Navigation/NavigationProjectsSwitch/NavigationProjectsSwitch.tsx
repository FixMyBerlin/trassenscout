import { Routes } from "@blitzjs/next"
import { Menu, Transition } from "@headlessui/react"
import { FolderIcon, FolderOpenIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useRouter } from "next/router"
import React, { Fragment, Suspense } from "react"
import { Link } from "src/core/components/links/Link"
import { Spinner } from "src/core/components/Spinner"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

const NavigationProjectsSwitchWithQuery: React.FC = () => {
  const { query } = useRouter()
  const user = useCurrentUser()
  const projects = user?.projects

  if (!projects || projects?.length <= 1) return null
  const menuItems = projects?.map((project) => ({
    name: project.shortTitle,
    slug: project.slug,
    href: Routes.ProjectDashboardPage({ projectSlug: project.slug }),
  }))

  return (
    <div className="sm:ml-6">
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
              <span className="sr-only">Trassenwechsel</span>
              <FolderIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    {menuItems.map((item) => {
                      const current = query.projectSlug === item.slug
                      return (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              classNameOverwrites={clsx(
                                current && "bg-gray-200",
                                active && "bg-gray-100",
                                "group flex w-full items-center rounded-md px-2 py-2 text-sm"
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      )
                    })}
                  </div>
                </Menu.Items>
              </Transition>
            )}
          </>
        )}
      </Menu>
    </div>
  )
}

export const NavigationProjectsSwitch: React.FC = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <NavigationProjectsSwitchWithQuery />
    </Suspense>
  )
}
