"use client"
import { Link } from "@/src/core/components/links"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { Route } from "next"
import { usePathname } from "next/navigation"
import { ProjectsSwitch } from "../NavigationLoggedIn/ProjectsSwitch"
import { shouldHighlight, useMenuItems } from "../NavigationLoggedInProject/useMenuItems"
import { NavigationGeneralLogo } from "../NavigationLoggedOut/TrassenscoutLogo"
import { NavigationUser } from "../NavigationUser/NavigationUser"

type Props = {
  homeLink: Route
  homeLinkText: string
  menuItems?: ReturnType<typeof useMenuItems>
  projects?: TGetProjects["projects"]
}

export const NavigationMobile = ({ homeLink, homeLinkText, menuItems, projects }: Props) => {
  const pathname = usePathname()

  return (
    <Disclosure as="div" className="relative flex flex-col sm:hidden">
      {({ open }) => (
        <>
          <div className="relative flex min-h-16 items-center justify-between sm:h-16">
            <div className="absolute inset-y-0 right-0 flex items-center space-x-2">
              {projects && <ProjectsSwitch projects={projects} />}

              <NavigationUser />

              {Boolean(menuItems?.length) && (
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                  <span className="sr-only">Hauptmenü öffnen</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              )}
            </div>
            <div className="flex flex-1 items-center justify-start sm:items-stretch">
              <div className="flex shrink-0 items-center">
                {pathname === homeLink ? (
                  <NavigationGeneralLogo beta={false} />
                ) : (
                  <Link href={homeLink}>
                    <NavigationGeneralLogo beta={false} />
                    <span className="sr-only">{homeLinkText}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <DisclosurePanel className="divide-y-2 divide-gray-900">
            <div className="space-y-3 pt-2 pb-3">
              {menuItems?.map((item) => {
                const current = shouldHighlight(item, pathname)

                return (
                  <DisclosureButton key={item.name} as="div">
                    <Link
                      href={item.href}
                      classNameOverwrites={clsx(
                        current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block rounded-md px-3 py-2 text-sm font-medium",
                      )}
                    >
                      {item.name}
                    </Link>
                  </DisclosureButton>
                )
              })}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}
