import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"
import { Link, isExternalHref } from "@/src/components/core/components/links/Link"
import { FooterBuildByLine } from "@/src/components/shared/app/layouts/footer/FooterBuildByLine"
import {
  authLinks,
  type FooterLink,
  publicLinks,
} from "@/src/components/shared/app/layouts/footer/links.const"
import { GitHubIcon } from "./GitHubIcon"
import {
  navigationMenuItemLinkStyles,
  navigationMenuTransitionProps,
} from "./navigationMenuItemStyles"

const githubRepositoryUrl = "https://github.com/FixMyBerlin/trassenscout/"
const [contactAndImprintLink, privacyLink] = publicLinks
const [supportLink] = authLinks
const metaLinks = [supportLink, privacyLink, contactAndImprintLink].filter(
  (link): link is FooterLink => Boolean(link),
)

function NavigationMetaMenuLink({ item, focus }: { item: FooterLink; focus: boolean }) {
  const classNameOverwrites = navigationMenuItemLinkStyles(focus)

  if (isExternalHref(item.href)) {
    return (
      <Link href={item.href} blank={item.blank} classNameOverwrites={classNameOverwrites}>
        {item.name}
      </Link>
    )
  }

  return (
    <Link to={item.href} blank={item.blank} classNameOverwrites={classNameOverwrites}>
      {item.name}
    </Link>
  )
}

export const NavigationMetaMenu = () => {
  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            className={twJoin(
              "relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
              open ? "bg-gray-500" : "",
            )}
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Weitere Links</span>
            <EllipsisHorizontalIcon className="size-7" aria-hidden="true" />
          </MenuButton>
          {open && (
            <Transition as={Fragment} {...navigationMenuTransitionProps}>
              <MenuItems
                modal={false}
                anchor="bottom end"
                className="z-20 mt-2 w-96 max-w-[calc(100vw-2rem)] origin-top-right rounded-md bg-white p-2 text-gray-500 shadow-lg ring-1 ring-gray-200 focus:outline-hidden"
              >
                <div className="space-y-1">
                  {metaLinks.map((item) => (
                    <MenuItem key={item.name}>
                      {({ focus }) => <NavigationMetaMenuLink item={item} focus={focus} />}
                    </MenuItem>
                  ))}
                </div>
                <div className="px-3 py-2">
                  <FooterBuildByLine className="flex-nowrap text-sm text-gray-700" />
                </div>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href={githubRepositoryUrl}
                      blank
                      classNameOverwrites={navigationMenuItemLinkStyles(focus)}
                    >
                      <span className="sr-only">GitHub Repository</span>
                      <GitHubIcon className="size-5" />
                    </Link>
                  )}
                </MenuItem>
              </MenuItems>
            </Transition>
          )}
        </>
      )}
    </Menu>
  )
}
