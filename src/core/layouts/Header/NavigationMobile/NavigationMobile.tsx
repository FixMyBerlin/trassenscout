import { Disclosure } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import React from "react"
import { MenuItems } from "../types"
import { User } from "../User"

type Props = MenuItems & {
  logo: React.ReactElement
}

export const NavigationMobile: React.FC<Props> = ({ menuItems, logo: Logo }) => {
  const { pathname } = useRouter()

  return (
    <Disclosure as="div" className="relative flex flex-col sm:hidden">
      {({ open }) => (
        <>
          <div className="relative flex min-h-[4rem] items-center justify-between sm:h-16">
            <div className="absolute inset-y-0 right-0 flex items-center space-x-2">
              <User />
              {Boolean(menuItems.length) && (
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
              <div className="flex flex-shrink-0 items-center">{Logo}</div>
            </div>
          </div>

          <Disclosure.Panel className="divide-y-2 divide-gray-900">
            <div className="space-y-1 pt-2 pb-3">
              {menuItems.map((item) => {
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
        </>
      )}
    </Disclosure>
  )
}
