import React, { Fragment } from "react"
import { Disclosure, Menu, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Link } from "src/core/components/links"
import { Routes } from "@blitzjs/next"

const primaryNavigation = [
  { name: "Dashboard", href: Routes.Rs8Index() },
  {
    name: "Teilstrecken",
    href: Routes.Rs8Teilstrecke1(),

    children: [
      { name: "Teilstrecke 1", href: Routes.Rs8Teilstrecke1() },
      { name: "Teilstrecke 2", href: Routes.Rs8Teilstrecke2() },
      { name: "Teilstrecke 3", href: Routes.Rs8Teilstrecke3() },
      { name: "Teilstrecke 4", href: Routes.Rs8Teilstrecke4() },
    ],
  },
  { name: "Termine", href: Routes.Rs8Termine() },
  { name: "Kontakte", href: Routes.Rs8Kontakte() },
  { name: "Impressum", href: Routes.Kontakt() },
]

export const PageNavigation: React.FC = () => {
  const { pathname } = useRouter()

  const itemClasses = (current: boolean) =>
    clsx(
      current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
      "rounded-md px-3 py-2 text-sm font-medium"
    )

  return (
    <div className="flex space-x-4">
      {primaryNavigation.map((item) => {
        const current = pathname === item.href.pathname

        if (!item.children) {
          return (
            <Link
              key={item.name}
              href={item.href}
              classNameOverwrites={itemClasses(current)}
              aria-current={current ? "page" : undefined}
            >
              {item.name}
            </Link>
          )
        }

        return (
          <Menu as="div" className="relative ml-3" key={item.name}>
            <Menu.Button
              className={clsx(
                itemClasses(current),
                "inline-flex w-full justify-center px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
              )}
            >
              {item.name}
              <ChevronDownIcon
                className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                aria-hidden="true"
              />
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  {item.children.map((child) => (
                    <Menu.Item key={child.name}>
                      {({ active }) => (
                        <Link
                          href={child.href}
                          classNameOverwrites={clsx(
                            current && "bg-gray-200",
                            active && "bg-gray-100",
                            "group flex w-full items-center rounded-md px-2 py-2 text-sm"
                          )}
                        >
                          {child.name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )
      })}
    </div>
  )
}

export const MobilePageNavigation: React.FC = () => {
  const { pathname } = useRouter()

  return (
    <Disclosure.Panel className="sm:hidden">
      <div className="space-y-1 px-2 pt-2 pb-3">
        {primaryNavigation.map((item) => {
          const current = pathname === item.href.pathname
          return (
            <Disclosure.Button
              key={item.name}
              as="a"
              href={item.href.pathname}
              className={clsx(
                current
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
              aria-current={current ? "page" : undefined}
            >
              {item.name}
            </Disclosure.Button>
          )
        })}
      </div>
    </Disclosure.Panel>
  )
}
