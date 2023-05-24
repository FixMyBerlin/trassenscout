import { Routes } from "@blitzjs/next"
import { Menu, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useRouter } from "next/router"
import React, { Fragment } from "react"
import { Link } from "src/core/components/links/Link"
import { shortTitle } from "src/core/components/text"
import { NavigationProps } from "../NavigationProject/NavigationProject"
import { ProjectLogo } from "../NavigationProject/ProjectLogo"

type Props = Pick<NavigationProps, "projects">

export const NavigationProjectsSwitch: React.FC<Props> = ({ projects }) => {
  const { query } = useRouter()

  // The 1 case is handeled by the Dashboard Link "Dashbaord RS8"
  if (!projects?.length || projects.length === 1) return null

  const projectsMenuItems = projects.map((project) => ({
    name: shortTitle(project.slug),
    slug: project.slug,
    href: Routes.ProjectDashboardPage({ projectSlug: project.slug }),
  }))

  const currentProject = projects.find((p) => p.slug === query.projectSlug)

  if (!currentProject) return null

  return (
    <Menu as="div" className="relative ml-3">
      {({ open }) => (
        <>
          <Menu.Button
            className={clsx(
              "flex rounded-md bg-yellow-500 px-2 py-2 text-sm font-medium text-gray-800",
              open ? "bg-yellow-400" : "hover:bg-yellow-400",
              "focus:outline-none focus:ring-2 focus:ring-white/30"
            )}
          >
            <span className="sr-only">Trassenwechsel</span>
            {shortTitle(currentProject.slug)}
            <ChevronDownIcon
              className="-mr-1.5 ml-0.5 h-5 w-5 pb-0.5 text-gray-900 hover:text-black"
              aria-hidden="true"
            />
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
              <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  {projectsMenuItems.map((item) => {
                    const current = query.projectSlug === item.slug
                    return (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            href={item.href}
                            classNameOverwrites={clsx(
                              current && "bg-gray-200",
                              active && "bg-gray-100",
                              "text-blue-500 hover:text-blue-800 flex items-center rounded-md px-2 py-2 text-sm gap-2 items-center"
                            )}
                          >
                            {current && <ProjectLogo />}
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
  )
}
