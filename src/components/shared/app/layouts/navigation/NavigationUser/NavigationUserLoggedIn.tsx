import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react"
import { clsx } from "clsx"
import { Fragment } from "react"
import { AdminBox } from "@/src/components/core/components/AdminBox/AdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import {
  showMembershipRoleCheckIndicatorCountActions,
  showMembershipRoleCheckIndicatorState,
} from "@/src/components/core/store/show-membership-role-check-indicator-store"
import { getFullname } from "@/src/components/core/users/getFullname"
import { isDev, isProduction, isStaging } from "@/src/components/core/utils/isEnv"
import { getInitials } from "@/src/components/shared/app/users/utils/getInitials"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import type { CurrentUser } from "@/src/server/users/types"

type Props = {
  user: CurrentUser
}

const menuItemLinkStyles = (focus: boolean) =>
  clsx(
    focus && "bg-gray-100",
    "block rounded-md px-3 py-2 text-sm text-gray-700 no-underline hover:text-blue-500",
  )

export const NavigationUserLoggedIn = ({ user }: Props) => {
  const showMembershipRoleCheckIndicator = showMembershipRoleCheckIndicatorState()
  const { toggleShowMembershipRoleCheckIndicator } = showMembershipRoleCheckIndicatorCountActions()

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            className={clsx(
              "relative flex max-w-xs cursor-pointer items-center rounded-full bg-blue-500 p-1 hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
              open && "bg-blue-400",
            )}
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">User-Menü</span>
            <div
              className="flex size-8 items-center justify-center text-lg font-semibold tracking-tighter text-gray-50 uppercase"
              aria-hidden="true"
            >
              {getInitials(user)}
            </div>
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
              <MenuItems
                modal={false}
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-gray-50 py-1 shadow-lg ring-1 ring-gray-200/5 focus:outline-hidden"
              >
                <div className="px-4 py-2 leading-6 text-gray-700">
                  <p className="mb-2 text-xs text-gray-400">Angemeldet als</p>
                  <p className="truncate font-semibold">{getFullname(user) || "-"}</p>
                  <p className="mb-2 truncate">{user.email}</p>
                  {user.institution && (
                    <p className="mb-2 truncate text-xs text-gray-400">{user.institution}</p>
                  )}

                  {isAdmin(user) && (
                    <AdminBox label="Admin" compact className="divide-y divide-purple-300">
                      <p className="font-semibold">Rolle: Admin</p>
                      <button
                        onClick={toggleShowMembershipRoleCheckIndicator}
                        className={clsx(linkStyles, "text-left leading-snug")}
                      >
                        {showMembershipRoleCheckIndicator ? "AN" : "AUS"}: Hervorheben, wo Element
                        abhängig von der Editor-Rolle angezeigt werden.
                      </button>
                      <pre className="overflow-x-auto text-[10px] leading-tight whitespace-pre-wrap">
                        {`Env: ${JSON.stringify({ isProduction, isStaging, isDev })}
VITE_APP_ENV: ${JSON.stringify(import.meta.env.VITE_APP_ENV)}
NODE_ENV: ${JSON.stringify(process.env.NODE_ENV)}`}
                      </pre>
                    </AdminBox>
                  )}
                </div>
                <div className="border-t border-gray-200 p-1.5 text-gray-700">
                  <MenuItem>
                    {({ focus }) => (
                      <Link to="/user/edit" classNameOverwrites={menuItemLinkStyles(focus)}>
                        Ihr Profil
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <Link to="/auth/logout" classNameOverwrites={menuItemLinkStyles(focus)}>
                        Abmelden
                      </Link>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          )}
        </>
      )}
    </Menu>
  )
}
