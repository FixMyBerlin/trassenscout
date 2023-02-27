import { Disclosure } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import React from "react"
import { Link } from "src/core/components/links"
import { NavigationProjectsSwitch } from "../NavigationProjectsSwitch"
import { NavigationUser } from "../NavigationUser"
import { MenuItem } from "../types"

type Props = {
  menuItems: MenuItem[]
  logo: React.ReactElement
}

export const NavigationMobile: React.FC<Props> = ({ menuItems, logo }) => {
  const { query, pathname } = useRouter()

  const itemClasses = (current: boolean) =>
    clsx(
      current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
      "rounded-md px-3 py-2 text-sm font-medium"
    )

  return (
    <Disclosure as="div" className="relative flex flex-col sm:hidden">
      {({ open }) => (
        <>
          <div className="relative flex min-h-[4rem] items-center justify-between sm:h-16">
            <div className="absolute inset-y-0 right-0 flex items-center space-x-2">
              <NavigationProjectsSwitch />
              <NavigationUser />
              {Boolean(menuItems?.length) && (
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Hauptmenü öffnen</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              )}
            </div>
            <div className="flex flex-1 items-center justify-start sm:items-stretch">
              <div className="flex flex-shrink-0 items-center">{logo}</div>
            </div>
          </div>

          <Disclosure.Panel className="divide-y-2 divide-gray-900">
            <div className="space-y-3 pt-2 pb-3">
              {menuItems?.map((item) => {
                if (!item.children) {
                  const current = pathname === item.href.pathname
                  return (
                    <Disclosure.Button key={item.name} as="div">
                      <Link href={item.href} classNameOverwrites={itemClasses(current)}>
                        {item.name}
                      </Link>
                    </Disclosure.Button>
                  )
                } else {
                  return (
                    <>
                      <Disclosure.Button key={item.name} as="div">
                        <div
                          className="rounded-md px-3 py-2 text-sm font-bold text-gray-300 hover:bg-gray-700"
                          key={item.name}
                        >
                          {item.name}
                        </div>
                      </Disclosure.Button>
                      {item.children.map((child) => {
                        const current = query.sectionSlug === child.slug // this works specifically for 'sectionSlug', not generic for items with children
                        return (
                          <Disclosure.Button key={child.name} className="pl-6" as="div">
                            <Link href={child.href} classNameOverwrites={itemClasses(current)}>
                              {child.name}
                            </Link>
                          </Disclosure.Button>
                        )
                      })}
                    </>
                  )
                }
              })}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
