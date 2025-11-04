"use client"
import { Link } from "@/src/core/components/links/Link"
import { shortTitle } from "@/src/core/components/text/titles"
import { useTryProjectSlug } from "@/src/core/routes/useProjectSlug"
import { CurrentUserCanIcon } from "@/src/pagesComponents/memberships/CurrentUserCanIcon"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { Fragment } from "react"

type Props = { projects: TGetProjects["projects"] }

export const ProjectsSwitch = ({ projects }: Props) => {
  const projectSlug = useTryProjectSlug()

  // The 1 case is handeled by the Dashboard Link "Dashbaord RS8"
  if (!projectSlug || !projects?.length || projects.length === 1) return null

  const projectsMenuItems = projects
    .map((project) => ({
      name: shortTitle(project.slug),
      slug: project.slug,
      href: `/${project.slug}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const currentProject = projects.find((p) => p.slug === projectSlug)

  return (
    <Menu as="div" className="relative ml-3">
      {({ open }) => (
        <>
          <MenuButton
            className={clsx(
              "flex rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-gray-800",
              open ? "bg-yellow-400" : "hover:bg-yellow-400 focus:bg-yellow-400",
              "focus:ring-2 focus:ring-white/30 focus:outline-hidden",
            )}
          >
            <span className="sr-only">Trassenwechsel</span>
            {currentProject ? shortTitle(currentProject.slug) : "Projekt wählen"}
            <ChevronDownIcon
              className="-mr-1.5 ml-0.5 h-5 w-5 text-gray-900 hover:text-black"
              aria-hidden="true"
            />
          </MenuButton>
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
              <MenuItems className="ring-opacity-5 absolute left-0 z-10 mt-2 max-h-[60vh] w-56 origin-top-right divide-y divide-gray-100 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-hidden">
                <div className="p-1.5">
                  <MenuItem key="dashboard">
                    {({ focus }) => (
                      <Link
                        href="/dashboard"
                        classNameOverwrites={clsx(
                          // current && "bg-gray-200",
                          focus && "bg-gray-100",
                          "flex items-center rounded-md px-3 py-2 text-sm text-blue-500 hover:text-blue-800",
                        )}
                      >
                        <strong>Meine Projekte</strong>
                      </Link>
                    )}
                  </MenuItem>

                  {projectsMenuItems.map((item) => {
                    const current = projectSlug === item.slug

                    return (
                      <MenuItem key={item.name}>
                        {({ focus }) => (
                          <Link
                            href={item.href}
                            classNameOverwrites={clsx(
                              current && "bg-gray-200",
                              focus && "bg-gray-100",
                              "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-blue-500 hover:text-blue-800",
                            )}
                          >
                            <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                              {/* {current && <ProjectLogo />} */}
                              {item.name}
                            </div>
                            <CurrentUserCanIcon projectSlug={item.slug} />
                          </Link>
                        )}
                      </MenuItem>
                    )
                  })}
                </div>
              </MenuItems>
            </Transition>
          )}
        </>
      )}
    </Menu>
  )
}
